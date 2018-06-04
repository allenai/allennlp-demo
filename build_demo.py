#!/usr/bin/env python

import os
from subprocess import run

run('npm install', shell=True, check=True, cwd='demo')
run('npm run build', shell=True, check=True, cwd='demo')
print('Demo built')
