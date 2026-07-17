# CloakCode

CloakCode is a VS Code extension that mirrors an existing GitHub Copilot chat to a phone-first web
app. It lets you see when an agent is blocked, answer its question, approve or deny a tool call,
and steer the session without returning to your desk.

## The problem

Coding agents often stop for the right reason: they need approval or clarification. The expensive
part is the delay before a developer notices. CloakCode moves that decision to the developer rather
than moving the repository or restarting the agent elsewhere.

## The constraint

The workspace must stay on the machine where VS Code is running. CloakCode mirrors the Copilot
transcript and the developer's replies through a local bridge and a private tunnel; it does not add
a path that uploads the repository.

## What it can do

- Show live Copilot sessions and notify you when one is blocked.
- Answer questions and send steering instructions from a phone.
- Approve or deny interactive tool calls.
- Stop a turn or queue the next message.
- Return to the native VS Code conversation without losing context.

## Try it

Install [CloakCode from the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=rexwel.cloakcode)
or explore the [source on GitHub](https://github.com/lsiddiquee/CloakCode).
