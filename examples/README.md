# 配套示例：CRM

《单元测试图解教程》第 7–10 章那个「修改用户邮箱」的 CRM，用三种语言各实现了一份，
都是教程最终推导出来的样子：

- **领域模型**（`User`、`Company`、领域事件、工厂）不碰任何进程外依赖 → **单元测试**，不用 Mock
- **控制器**只做编排 → **一个集成测试**：数据库用真的 PostgreSQL，消息总线在最边缘用手写的 Spy，支持日志用 Mock

| 目录 | 语言与工具 |
|---|---|
| [`python/`](python) | Python 3.10+ · pytest · psycopg |
| [`java/`](java) | Java 21 · Maven · JUnit 5 · AssertJ · Mockito · JDBC |
| [`ts/`](ts) | Node 20+ · TypeScript · Vitest · pg |
| [`db/migrations/`](db/migrations) | 三个版本共用的数据库迁移脚本 |

## 运行

### 单元测试（不需要数据库）

```bash
# Python
cd python && python3 -m venv .venv && .venv/bin/pip install -e '.[dev]'
.venv/bin/pytest tests/unit

# Java
cd java && mvn test

# TypeScript
cd ts && npm install && npm test
```

### 集成测试（需要 Docker）

先在 `examples/` 目录下启动数据库（只监听本机的 54329 端口）：

```bash
docker compose up -d --wait
```

然后：

```bash
# Python
cd python && .venv/bin/pytest tests/integration

# Java
cd java && mvn test -Pintegration      # 单元 + 集成一起跑

# TypeScript
cd ts && npm run test:integration
```

用完后 `docker compose down -v` 可以连数据一起删掉。
想连别的数据库实例，设置环境变量 `CRM_DB_URL`
（Java 用 JDBC 格式：`jdbc:postgresql://host:port/db?user=…&password=…`）。

### 覆盖率

```bash
cd python && .venv/bin/pytest tests/unit --cov=crm --cov-branch
cd java   && mvn test                  # 报告在 target/site/jacoco/index.html
cd ts     && npm run coverage
```

只跑单元测试时，你会看到领域模型的覆盖率接近 100%，而控制器和仓储是 0% ——
这不是疏漏：它们由集成测试覆盖（教程第 7、8 章）。

### 变异测试（教程第 14 章）

覆盖率只说明代码被执行过；变异测试检查的是「代码被改错时，测试会不会发现」。
三份示例都只对领域模型做变异、只用单元测试来检验：

```bash
cd python && .venv/bin/pip install -e '.[mutation]' && .venv/bin/mutmut run   # 之后用 mutmut results 看幸存者
cd java   && mvn test-compile org.pitest:pitest-maven:mutationCoverage         # 报告在 target/pit-reports/index.html
cd ts     && npm run mutation
```

mutmut 依赖 `fork`，在 Windows 上需要通过 WSL 运行。

## 代码怎么对应教程

| 代码 | 教程章节 |
|---|---|
| `domain`：`User.changeEmail`、`canChangeEmail`、领域事件、`Company` | 第 7 章 |
| `application`：`UserController`、`EventDispatcher`、`DomainLogger` | 第 7、8 章 |
| `application`：`IBus` / `MessageBus` 两层；测试里的 `BusSpy` | 第 9 章 |
| `persistence`：`Transaction` 与仓储分离 | 第 10 章 |
| 集成测试：开始时清库、每段一个事务、工厂方法 / `execute` / 流式断言 | 第 10 章 |

## 关于数据库迁移

为了让示例不依赖某个语言的迁移工具，这里用了最朴素的办法：
`docker-compose.yml` 把 `db/migrations/` 挂进容器，PostgreSQL 在**第一次初始化**时按文件名顺序执行。
所以新增迁移后要 `docker compose down -v` 重建。真实项目请用 Flyway / Alembic / Knex 之类的迁移工具，
它们会记录每个数据库已经执行到哪一个迁移（第 10 章）。
