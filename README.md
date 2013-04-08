Deborah Hay "No Time To Fly" online score
=========================================

This directory contains the files needed to build the (soon to be) online score for the Deborah Hay piece "No Time To Fly" as part of the Motion Bank research project. 

http://motionbank.org/
http://theforsythecompany.com/

We are using Brunch (brunch.io) for the frontend build process as it's watch feature is insanly useful.

Install brunch:

    npm install -g brunch

Then install needed node modules (see package.json)

    npm install

Ready!

The important directories are app / public / vendor. App & vendor are compiled into public which is the final website. Inside app everything inside "assets" is just copied over to "public" and all other files are compiled as it's set up in config.coffee.

Build once:

    brunch build

Continuously build (watch):

    brunch watch

Continuously build and serve:

    brunch watch --server

