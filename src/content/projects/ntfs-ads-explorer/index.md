---
title: NTFS ADS Explorer
summary: A Windows app for finding, inspecting, adding and removing NTFS alternate data streams, without administrator rights.
band: software
type: windows-app
date: 2026-06-24
repo: https://github.com/BlesseDevil/ntfs-ads-explorer
stack: ["Rust", "WinUI 3", "SQLite"]
featured: true
draft: false
---

Alternate data streams are named data forks that NTFS lets you attach to any file or folder. They do not change the file's visible size or content, most tools cannot see them, and they are silently lost when a file is copied to a FAT or exFAT drive or uploaded to the cloud. Windows itself uses them, for example to mark a file as downloaded from the internet.

NTFS ADS Explorer makes them visible and manageable. It is built for people who keep large personal archives and want to know what is attached to their files.

## What it does

- **Browse like Explorer.** A folder tree and a file list, with a badge on every file that carries streams.
- **Inspect.** Each stream's name, size, detected content type and classification (Mark-of-the-Web, system, integrity or unknown).
- **Filter.** Show only files with streams, or hide the system ones.
- **Add, extract, open and delete** streams.

## How it stays safe

- **No administrator rights, ever.** Everything runs as a standard user. Files you cannot access are skipped and counted, and no elevation prompt is shown.
- **Only documented Windows file APIs.** The tool never opens a raw volume or parses NTFS structures itself, so it cannot corrupt a file system.
- **Deletes are backed up first.** Every deleted stream is copied to a backup folder before it is removed, and old backups are purged after 15 days by default.
- **No hidden writes.** Opening a stream writes nothing to disk unless you ask to extract it.

The core is written in Rust with a WinUI 3 interface. It is in active development: browse mode and the first write operations work today, and background indexing of whole volumes is planned.

Free and open source under the AGPL.
