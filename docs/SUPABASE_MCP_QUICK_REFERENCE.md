# Supabase Remote MCP - Quick Reference

## 🚀 Quick Start

### Production (Remote)
```
https://mcp.supabase.com/mcp
```

### Development (Local)
```
http://localhost:54321/mcp
```

## 🔧 URL Customization

### Basic URLs

| Purpose | URL |
|---------|-----|
| All projects | `https://mcp.supabase.com/mcp` |
| Specific project | `https://mcp.supabase.com/mcp?project=xptonqqagxcpzlgndilj` |
| Read-only | `https://mcp.supabase.com/mcp?readonly=true` |
| Local dev | `http://localhost:54321/mcp` |

### Feature Groups

```
https://mcp.supabase.com/mcp?features=database,docs,debugging
```

Available features:
- `account` - Project management
- `docs` - Documentation search
- `database` - SQL queries, schema
- `debugging` - Logs
- `development` - Migrations, branches
- `functions` - Edge Functions
- `storage` - Storage buckets
- `branching` - Preview branches (paid)

### Combined Example

```
https://mcp.supabase.com/mcp?project=xptonqqagxcpzlgndilj&readonly=true&features=database,docs
```

## 🛠️ Available Tools

### Account
- `list_projects` - List all projects
- `get_project` - Get project details

### Database
- `execute_sql` - Run SQL queries
- `list_tables` - List tables
- `get_table_schema` - Get table structure
- `create_migration` - Create migration

### Documentation
- `search_docs` - Search Supabase docs (hybrid search)

### Development
- `get_advisors` - Security & performance tips
- `run_migration` - Execute migrations
- `create_branch` - Create preview branch

### Edge Functions
- `list_functions` - List functions
- `get_function` - Get function code
- `deploy_function` - Deploy function

### Storage
- `list_buckets` - List buckets
- `get_bucket` - Get bucket config
- `update_bucket` - Update bucket

### Debugging
- `get_logs` - Fetch service logs

## 📝 Common Use Cases

### 1. Query Database

```typescript
// AI Agent will use: execute_sql
"Show me all animals in the database"
"Count how many tutors are registered"
"Find all appointments for today"
```

### 2. Search Documentation

```typescript
// AI Agent will use: search_docs
"How do I set up Row Level Security?"
"What's the syntax for Edge Functions?"
"How to configure storage buckets?"
```

### 3. Get Security Recommendations

```typescript
// AI Agent will use: get_advisors
"Check my database for security issues"
"What performance improvements can I make?"
```

### 4. Deploy Edge Function

```typescript
// AI Agent will use: deploy_function
"Deploy the whatsapp-webhook function"
"Update the appointment-reminder function"
```

### 5. View Logs

```typescript
// AI Agent will use: get_logs
"Show me recent database errors"
"Get logs from the Edge Functions"
```

## 🔐 Security Best Practices

### ✅ DO

- Use project-scoped mode for production work
- Enable read-only mode when you don't need writes
- Limit feature groups to what you need
- Use local MCP for development
- Review advisor recommendations regularly

### ❌ DON'T

- Connect to production databases
- Share OAuth tokens
- Disable all security features
- Run untested SQL from AI agents
- Ignore security advisors

## 🐛 Troubleshooting

### Authentication Failed

```bash
# Clear browser cookies
# Try incognito mode
# Verify you're logged into correct Supabase account
```

### Connection Timeout

```bash
# Check internet connection
# Verify URL is correct
# Try without query parameters
# Check MCP client logs
```

### Local MCP Not Working

```bash
# Ensure Supabase is running
supabase status

# Restart if needed
supabase stop
supabase start

# Verify port 54321 is accessible
curl http://localhost:54321/mcp
```

### Tools Not Showing

```bash
# Check feature groups in URL
# Verify OAuth permissions
# Restart MCP client
# Check client logs for errors
```

## 📊 Comparison: Old vs New

| Feature | Old (stdio) | New (remote) |
|---------|-------------|--------------|
| Setup | Complex `npx` command | Single URL |
| Auth | Manual PAT token | OAuth2 browser |
| Clients | Limited (Cursor, Claude Code) | Many (ChatGPT, Claude.ai, etc) |
| Node.js | Required | Not required |
| Debugging | Difficult | Easy |
| Local support | Limited | Full support |
| Security | Token in config | Secure OAuth |

## 🎯 DIBEA Project URLs

### Production (Recommended)

```
https://mcp.supabase.com/mcp?project=xptonqqagxcpzlgndilj&features=database,docs,debugging,development,functions,storage
```

### Development (Local)

```
http://localhost:54321/mcp
```

### Read-Only (Safe Testing)

```
https://mcp.supabase.com/mcp?project=xptonqqagxcpzlgndilj&readonly=true&features=database,docs
```

## 📚 Resources

- [Full Setup Guide](./SUPABASE_REMOTE_MCP_SETUP.md)
- [Supabase MCP Docs](https://supabase.com/docs/guides/getting-started/mcp)
- [MCP Spec](https://modelcontextprotocol.io/)
- [DIBEA Supabase Reference](./DIBEA_SUPABASE_REFERENCE.md)

## 💡 Pro Tips

1. **Start with docs search** - Use `search_docs` to learn Supabase features
2. **Use advisors** - Run `get_advisors` regularly for best practices
3. **Test locally first** - Use local MCP before touching production
4. **Scope your access** - Use project-scoped + read-only for safety
5. **Limit features** - Only enable what you need to reduce attack surface

## 🔄 Migration Checklist

If migrating from old stdio MCP:

- [ ] Update `.opencode/opencode.json` to use remote URL
- [ ] Remove `SUPABASE_ACCESS_TOKEN` from environment
- [ ] Test OAuth2 authentication flow
- [ ] Verify all tools work correctly
- [ ] Update AI client configurations
- [ ] Remove old `npx` commands from docs
- [ ] Test local development setup
- [ ] Update team documentation

## 🎉 Benefits

- ✅ **Simpler** - One URL vs complex setup
- ✅ **Faster** - No Node.js overhead
- ✅ **Safer** - OAuth2 vs manual tokens
- ✅ **More powerful** - More tools and features
- ✅ **Better DX** - Easier debugging and errors
- ✅ **More clients** - Works with ChatGPT, Claude.ai, etc
- ✅ **Local support** - First-class local development

