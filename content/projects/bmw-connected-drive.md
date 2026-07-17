# bmw-connected-drive

An unofficial **TypeScript client** for BMW ConnectedDrive services, published to npm. It was
reverse-engineered from the REST calls used by the BMW ConnectedDrive web app, and could both read
vehicle data and trigger remote services such as climate control.

## What it did

- Listed vehicles associated with an account.
- Read vehicle status and telematics.
- Triggered remote services (for example, starting and stopping remote climate control).

## Why it's archived

The library depended on BMW's private web-app endpoints, including **write** operations for remote
services. BMW has since closed off that write access, which removes the feature that made the
library interesting. The successor project,
[BMW Connected for Homey](/projects/bmw-connected-homey), takes the opposite, sanctioned approach:
read-only access through BMW's official CarData API.

## Disclaimer

This library was never an official BMW integration and was neither endorsed nor supported by BMW. It
is kept public for reference.

## Source

Explore the [source on GitHub](https://github.com/lsiddiquee/bmw-connected-drive).
