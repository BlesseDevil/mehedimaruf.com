---
title: rSimpLone for Windows, Linux and macOS
summary: A desktop app for rclone, with builds for Windows, Linux and macOS. Copy, sync and move files to cloud storage with a dry-run preview first, saved jobs, a scheduler and mounts.
band: software
type: desktop-app
date: 2026-11-09
repo: https://github.com/BlesseDevil/rsimplone
releaseUrl: https://rsimplone.mehedimaruf.com
stack: ["Python", "rclone"]
featured: true
draft: false
---

rclone is the best tool there is for moving files to cloud storage, and it is a command line with several hundred flags. rSimpLone puts a window on it: pick the folders, press **Preview**, read what would happen, then run it for real.

It started with one situation: a big folder on a slow USB hard drive, a modest home connection, Google Drive on the other end, and a strong wish not to re-read or re-upload anything that did not need it. It turned into a complete rclone front end.

## What it does

- **Copy, Sync and Move jobs.** Copy never deletes. Sync moves replaced and removed files into a dated backup folder instead of deleting them. Move verifies every file by checksum before the original is removed, and a real run unlocks only after a preview of the exact same job.
- **Preview first.** Every job can be run as rclone's dry run, which changes nothing.
- **Saved jobs, several at once.** Two jobs cannot write to the same place at the same time.
- **Scheduler.** Daily, weekly or every N minutes while the app is open.
- **Mounts.** Mount a remote, or one folder of it, as a drive. Read-only by default.
- **Remotes.** Add, test, edit and delete cloud connections without leaving the app, including encrypted (crypt) remotes.
- **Every rclone flag.** Read from your own rclone version, with a description on hover.

## Guard rails

Sync and Move refuse to run without a backup folder, and refuse an empty source, because a disconnected drive otherwise looks exactly like "everything was deleted". Passwords are never shown or logged.

Free and open source under the AGPL.
