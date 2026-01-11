#!/bin/bash
kind create cluster --name kind-lab --config kind.yaml
./helm/setup-infra.sh