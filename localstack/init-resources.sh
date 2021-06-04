#!/usr/bin/env bash

awslocal sqs create-queue --queue-name submissions
awslocal kinesis create-stream --stream-name events --shard-count 2