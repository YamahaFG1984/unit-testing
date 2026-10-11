import { defineConfig } from 'vitest/config'

// 两组测试：单元测试可以并行；集成测试共用一个数据库，必须顺序执行（第 10 章）。
export default defineConfig({
  test: {
    coverage: { include: ['src/**'] },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          // 所有集成测试文件放进同一个进程里依次执行
          pool: 'forks',
          poolOptions: { forks: { singleFork: true } },
        },
      },
    ],
  },
})
