A .NET library that acts as a **dynamic metadata provider** for
[Semantic Kernel](https://github.com/microsoft/semantic-kernel) plugins, so a plugin's descriptions
and parameters can be adjusted at runtime rather than baked in at compile time.

## The idea

Semantic Kernel decides when and how to call a plugin largely from its metadata — the function and
parameter descriptions the model sees. SemanticPluginForge makes that metadata a runtime concern: a
pluggable provider can supply, override, or refine descriptions on the fly, without recompiling the
plugin. That opens the door to tuning how the model interprets a tool based on context or
experimentation.

## Highlights

- Runtime metadata overrides for Semantic Kernel functions and parameters.
- Extensible provider architecture for supplying descriptions from any source.
- Written in C#, released under the MIT license.

## On the Microsoft DevBlogs

I wrote the library up for Microsoft's Agent Framework blog:
[Enhancing Plugin Metadata Management with SemanticPluginForge](https://devblogs.microsoft.com/agent-framework/enhancing-plugin-metadata-management-with-semanticpluginforge/).

## Status

The project is currently **parked** — it's public and functional, but not under active development.

## Source

Explore the [source on GitHub](https://github.com/lsiddiquee/SemanticPluginForge).
