# Reaper Cleaner

A project aiming to help clean up when you have lots and lots of Reaper projects. Especially useful when you have multiple projects sharing one media directory.

## Project status: proof of concept

**DO NOT use this!!**

Known issues:

- barely tested
- completely oblivious to files used by plugins
- only looks in _test_files_ directory ... should be a param (or some sort of packaging with UI?)
- Throws all unused files into one directory - makes recovery **impossible**

## How does it work?

- Finds all media files in the target directory
- Crosschecks against all references found in .rpp and .rpp-bak files in the target directory
- Moves all unused files into unused_media_files (should retain directory structure for easier error-recovery?)
