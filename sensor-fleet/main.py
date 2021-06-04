import base64
import os
import json
import random
import uuid
import time
from datetime import datetime

import boto3
from botocore.config import Config
from botocore.exceptions import EndpointConnectionError, ClientError


SQS_ENDPOINT_URL = os.environ.get("SQS_ENDPOINT_URL", "http://localstack:4566")
FLEET_SIZE = int(os.environ.get("FLEET_SIZE", 10))

COMMANDS = [
    "whoami",
    "notepad.exe",
    "calculator.exe"
]

SOURCE_IPS = [
    "192.168.0.1",
    "192.168.0.2"
]

DESTINATION_IPS = [
    "142.250.74.110",
    "23.13.252.39"
]

USERS = [
    "admin",
    "evil-guy",
    "john"
]

def generate_network_event(invalid_probability=0.01):
    """
    Generates a random network event with some probability for invalid values
    """
    random_ip = random.choice(DESTINATION_IPS) if random.uniform(0, 1) > invalid_probability else 'not-an-ip'
    return {
        "source_ip": random.choice(SOURCE_IPS),
        "destination_ip": random_ip,
        "destination_port": random.randint(0, 65535)
    }


def generate_new_process_event(invalid_probability=0.01):
    """
    Generates a random new process event with some probability for invalid values
    """
    return {
        "cmdl": random.choice(COMMANDS) if random.uniform(0, 1) > invalid_probability else None,
        "user": random.choice(USERS)
    }


def generate_submission(device_id, invalid_probability=0.01):
    """
    Generates a sensor submission with some probability for invalid data
    """
    return {
        "submission_id": str(uuid.uuid4()) if random.uniform(0, 1) > invalid_probability else 'not-an-uuid',
        "device_id": device_id if random.uniform(0, 1) > invalid_probability else 'not-an-uuid',
        "time_created": datetime.now().isoformat(),
        "events": {
            "new_process": [generate_new_process_event() for _ in range(random.randint(3, 5))],
            "network_connection": [generate_network_event() for _ in range(random.randint(3, 5))]
        }
    }


def send_submissions(sqs_client, submissions):
    queue_url = sqs_client.get_queue_url(QueueName='submissions')['QueueUrl']
    for submission in submissions:
        encoded_submission = json.dumps(submission).encode()
        message = base64.b64encode(encoded_submission).decode()
        sqs_client.send_message(QueueUrl=queue_url, MessageBody=message)


def main():
    print("Starting sensor fleet")
    config = Config(
        region_name = 'eu-west-1',
        retries = {
            'max_attempts': 3,
            'mode': 'standard'
        }
    )
    sqs_client = boto3.client('sqs', config=config, endpoint_url=SQS_ENDPOINT_URL, verify=False)
    # use fixed number of sensors in the fleet
    device_ids = [str(uuid.uuid4()) for _ in range(FLEET_SIZE)]
    while True:
        print("Sending submissions...")
        submissions = [generate_submission(device_id) for device_id in device_ids]
        try:
            send_submissions(sqs_client, submissions)
        except (EndpointConnectionError, ClientError):
            pass
        time.sleep(random.randint(30, 45))


if __name__ == '__main__':
    main()
