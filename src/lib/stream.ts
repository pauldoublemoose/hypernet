import type { SpaceExpr } from './space'

export type StreamView = Exclude<SpaceExpr, 'page'>
