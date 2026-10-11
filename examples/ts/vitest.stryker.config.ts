import { defineConfig } from 'vitest/config'

// Stryker 只需要单元测试：快，而且不依赖数据库
export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'] },
})
