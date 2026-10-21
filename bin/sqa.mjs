#!/usr/bin/env node
// Runs the TypeScript sources directly, so installing from GitHub needs no build step.
import { tsImport } from 'tsx/esm/api'

await tsImport('../src/cli.ts', import.meta.url)
