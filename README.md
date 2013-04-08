Motion Bank Deborah Hay online score for No Time To Fly, prototype
==================================================================

This directory contains the files needed to build the online score. We are using Brunch (brunch.io) for the building as it's watch feature is insanly useful.

The important directories are app / public / vendor. App & vendor are compiled into public which is the final website. Inside app everything inside assets is just copied over to public and all other files are compiled as it's set up in config.coffee.

Build:
brunch build

Watch:
brunch watch

fjenett - 2013-04