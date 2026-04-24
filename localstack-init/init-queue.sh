#!/bin/bash
awslocal sqs create-queue --queue-name adcrivo-ad-events-local
echo "Initialized SQS queue: adcrivo-ad-events-local"
