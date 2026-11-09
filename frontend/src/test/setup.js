import { TextDecoder, TextEncoder } from 'node:util'
import '@testing-library/jest-dom'

globalThis.TextDecoder = TextDecoder
globalThis.TextEncoder = TextEncoder
