---
title: NTFS ADS Explorer
summary: An unprivileged NTFS alternate data stream manager — an all-in-one tool for working with NTFS alternate data streams.
band: software
type: windows-app
date: 2026-06-24
repo: https://github.com/BlesseDevil/ntfs-ads-explorer
stack: ["Rust"]
featured: true
draft: false
---

Alternate data streams are a feature of the NTFS file system that let extra data be attached to a file without changing its visible size or content, which makes them easy to overlook and, at times, easy to misuse. NTFS ADS Explorer is an all-in-one tool for working with these streams. It runs without administrator rights, which matters because most tools for handling alternate data streams assume elevated access.
