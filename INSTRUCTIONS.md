# Instructions for homework

This file contains instructions and requirements for the homework.

## Description

A basic element of any Endpoint Detection and Response (EDR) solution is to have an agent running on the endpoint that collects telemetry from the device. In this excercise you'll be developing a preprocessing component for an EDR backend that processes these telemetry submissions from sensors, applies some simple data reformatting to them and publishes the processed data.

There is a lot of freedom to choose software technologies, tools and data formats to achieve the goal.
Note that the task is meant for evaluating both software development and software architecture design skills. Pay attention to the design, documentation and overall quality of the application you create. Approach it as you would any professional task at work.

## Environment

You are provided with a Docker Compose based environment where you have the following services:

* `localstack`: An open source tool which provides AWS API compatible services that can be used locally
* `sensor-fleet`: Simulating a fleet of EDR sensors which are each submitting telemetry at periodic intervals

There are 2 pre-baked resources in the Localstack environment:

* SQS queue `submissions`: incoming submissions can be read from this queue
* Kinesis stream `events`: outgoing events are published to this stream

If you are not familiar with Docker or Docker Compose, you can read more about it on https://docs.docker.com/compose/.

## Setup

To setup the environment you need to install Docker and Docker Compose. To install those, please follow the instructions on https://docs.docker.com/get-docker/ and https://docs.docker.com/compose/install/.

To validate your installation, you can run `docker run hello-world`. If everything went well, you should see something like below:

```console
$ docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
b8dfde127a29: Pull complete 
Digest: sha256:308866a43596e83578c7dfa15e27a73011bdd402185a84c5cd7f32a88b501a24
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.
```


_If you have any trouble with the setup, contact the hiring manager._

### Running the services

To launch the services, use `docker-compose up -d`. This will launch localstack and sensor-fleet to run on the background (it may take a while to download Docker images that are used). 

To validate that the services have been started up properly, run the following commands and expect similar responses as in the examples below:


```console
$ docker-compose exec localstack awslocal sqs list-queues
{
    "QueueUrls": [
        "http://localhost:4566/000000000000/submissions"
    ]
}
```

```console
$ docker-compose exec localstack awslocal kinesis list-streams
{
    "StreamNames": [
        "events"
    ]
}
```

To validate that sensor-fleet is working and publishing submissions to SQS:

```console
$ docker-compose exec localstack awslocal sqs receive-message --queue-url http://localhost:4566/000000000000/submissions
{
    "Messages": [
        {
            "MessageId": "8bcc287b-0970-e8d4-001e-a5e6a7282efc",
            "ReceiptHandle": "ev...ch",
            "MD5OfBody": "4ca38114dc7ee7f7b5c2781170fd62da",
            "Body": "ey...19"
        }
    ]
}
```

Should you have any problems with the environment, you can fully reset it by executing `docker-compose down` and then `docker-compose up -d`.

## Assignment details

Sensors are submitting telemetry in the following JSON format:

```yaml
{
    "submission_id": "<uuid>",                        # unique identifier of the submission (string)
    "device_id": "<uuid>",                            # unique identifier of the device (string)
    "time_created": "<ISO 8601>",                     # creation time of the submission, device local time (string)
    "events": {
        "new_process": [                              # list of new_process events
            {
                "cmdl": "<commandline>",              # command line of the executed process (string)
                "user": "<username>"                  # username who started the process (string)
            },
            ...
        ],
        "network_connection": [                       # list of network_connection events
            {
                "source_ip": "<ipv4>",                # source ip of the network connection, e.g. "192.168.0.1" (string)
                "destination_ip": "<ipv4>",           # destination ip of the network connection, e.g. "142.250.74.110" (string)
                "destination_port": <0-65535>         # destination port of the network connection, e.g. 443 (integer)
            },
            ...
        ]
    }
}
```

Note that each submission can contain a batch (0 or more) of events of 2 different types (`new_process` & `network_connection`).

Your task is to implement a service complying with the functionality and requirements below.

### Main functions

* runs continuously until terminated
* reads submissions from `submissions` SQS queue
* publishes events to `events` Kinesis stream (you can freely design the event format)

### Requirements

* each event is published as an individual record to kinesis (one submission is turned into multiple events)
* each event must have information of the event type (`new_process` or `network_connection`)
* each event must have an unique identifier
* each event must have an identifier of the source device (`device_id`)
* each event must have a timestamp when it was processed (backend side time in UTC)
* submissions are validated and invalid or broken submissions are dropped
* must guarantee no data loss (for valid data), i.e. submissions must not be deleted before all events are succesfully published
* must guarantee ordering of events in the context of a single submission
* the number of messages read from SQS with a single request must be configurable
* the visibility timeout of read SQS messages must be configurable


### Optional design questions

* How does your application scale and guarantee near-realtime processing when the incoming traffic increases? Where are the possible bottlenecks and how to tackle those?
* What kind of metrics you would collect from the application to get visibility to its througput, performance and health?
* How would you deploy your application in a real world scenario? What kind of testing, deployment stages or quality gates you would build to ensure a safe production deployment?

### Deliverables

* The software is delivered with the full source code included. All used source code must be freely distributable.
* Include a README.md which
    * describes the software and how it meets the requirements
    * describes how to install and run the software
    * documents the outgoing event data format
    * includes answers to the optional design questions


### Tips

* You need to use AWS SDK of your preferred language
* When initializing SQS or Kinesis clients, override the default endpoint url with an url that points to the localstack address (http://localhost:4566 from host or http://localstack:4566 inside Docker)
* If you are not familiar with AWS SQS or AWS Kinesis, you can read about them on https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html and https://docs.aws.amazon.com/streams/latest/dev/introduction.html. However, you only need to know how to receive and delete messages from SQS and how to publish records to Kinesis with the language of your choice.
* You may need to provide dummy AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to your app
