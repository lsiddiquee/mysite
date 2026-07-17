# BMW Connected for Homey

A [Homey](https://homey.app) app that brings BMW and Mini vehicle data into your smart home using
the **official BMW CarData API**.

## What it does

The app provides read-only access to vehicle telematics — location, battery and fuel levels, door
and window status, charging information, and more. Real-time updates are delivered over **MQTT
streaming**, with a fallback to REST API polling when streaming is unavailable.

## Why the official API matters

An earlier effort relied on reverse-engineering BMW's private endpoints, which is fragile and broke
whenever BMW changed things. This app is built on BMW's official **CarData** program instead:
pairing uses the OAuth device-code flow, and access is scoped to the data BMW officially exposes.
That trade — read-only, but stable and sanctioned — is the whole design.

## Highlights

- Official BMW CarData API integration (no reverse engineering).
- Real-time telematics via MQTT streaming, with REST polling fallback.
- OAuth device-code pairing tied to your own CarData Client ID.
- Supports both BMW and Mini vehicles.

## Source

Explore the [source on GitHub](https://github.com/lsiddiquee/com.rexwel.bmwconnected).
