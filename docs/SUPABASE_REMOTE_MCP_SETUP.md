# Supabase Remote MCP Server Setup Guide

## Overview

This guide explains how to set up the **Supabase Remote MCP Server** for the DIBEA project. The remote MCP server provides a simpler, more powerful way to connect AI agents with your Supabase project compared to the previous `stdio` approach.

## What is Remote MCP?

The Remote MCP server runs over HTTP and provides:

- ✅ **Simpler setup** - Just one URL instead of complex `npx` commands
- ✅ **OAuth2 authentication** - Secure browser-based login (no manual PAT tokens)
- ✅ **More AI clients** - Works with ChatGPT, Claude.ai, Builder.io, and more
- ✅ **Better debugging** - No Node.js version conflicts or environment issues
- ✅ **Local support** - Works with local Supabase instances via CLI

## Quick Start

### Remote Supabase (Production)

**URL:** `https://mcp.supabase.com/mcp`

This connects to your Supabase cloud projects (like `xptonqqagxcpzlgndilj`).

### Local Supabase (Development)

**URL:** `http://localhost:54321/mcp`

This connects to your local Supabase instance when running `supabase start`.

## Configuration

### 1. Update OpenCode Configuration

The `.opencode/opencode.json` file has been updated to use the remote MCP server:

```json
{
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp",
      "enabled": true,
      "description": "Remote Supabase MCP server with OAuth2 authentication",
      "features": [
        "account",
        "docs",
        "database",
        "debugging",
        "development",
        "functions",
        "storage"
      ],
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

### 2. Feature Groups

You can customize which tools are exposed by modifying the `features` array:

- **`account`** - List projects, get project details
- **`docs`** - Search Supabase documentation (self-RAG)
- **`database`** - Execute SQL queries, manage schema
- **`debugging`** - Fetch logs from services
- **`development`** - Run migrations, manage branches
- **`functions`** - Deploy and manage Edge Functions
- **`storage`** - Manage storage buckets and files
- **`branching`** - Preview branches (requires paid plan)

### 3. URL Customization

You can customize the MCP URL with query parameters:

#### Project-Scoped Mode

Connect to a specific project only:

```
https://mcp.supabase.com/mcp?project=xptonqqagxcpzlgndilj
```

#### Read-Only Mode

Prevent any write operations (implemented at Postgres role level):

```
https://mcp.supabase.com/mcp?readonly=true
```

#### Feature Groups

Enable only specific feature groups:

```
https://mcp.supabase.com/mcp?features=database,docs,debugging
```

#### Combined Example

```
https://mcp.supabase.com/mcp?project=xptonqqagxcpzlgndilj&readonly=true&features=database,docs
```

## Authentication

### OAuth2 Flow (Recommended)

When you first connect, the MCP client will:

1. Open a browser window
2. Redirect to Supabase login
3. Ask for permission to access your projects
4. Store the access token securely

**No manual token generation required!**

### Security Best Practices

1. **Use project-scoped mode** for production work
2. **Enable read-only mode** when you don't need write access
3. **Limit feature groups** to only what you need
4. **Never use in production databases** - MCP is for development only

## Available Tools

### Account Tools

- `list_projects` - List all Supabase projects
- `get_project` - Get details of a specific project

### Database Tools

- `execute_sql` - Run SQL queries
- `list_tables` - List all tables
- `get_table_schema` - Get table structure
- `create_migration` - Create database migration

### Documentation Tools

- `search_docs` - Search Supabase documentation with hybrid search (semantic + keyword)

### Development Tools

- `get_advisors` - Get security and performance recommendations
- `run_migration` - Execute database migrations
- `create_branch` - Create preview branch (paid plans)

### Edge Functions Tools

- `list_functions` - List all Edge Functions
- `get_function` - Get function code
- `deploy_function` - Deploy Edge Function

### Storage Tools

- `list_buckets` - List storage buckets
- `get_bucket` - Get bucket configuration
- `update_bucket` - Update bucket settings

### Debugging Tools

- `get_logs` - Fetch logs from any Supabase service

## Local Development Setup

### 1. Start Local Supabase

```bash
cd /Users/pedroreichow/projects/dibea
supabase start
```

This starts Supabase locally on `http://localhost:54321`.

### 2. Update MCP URL for Local

In your AI client configuration, use:

```
http://localhost:54321/mcp
```

### 3. No Authentication Required

Local instances don't require OAuth2 - they're automatically authenticated.

## Integration with AI Clients

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project=xptonqqagxcpzlgndilj"
    }
  }
}
```

### Cursor

Add to Cursor settings:

```json
{
  "mcp.servers": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project=xptonqqagxcpzlgndilj"
    }
  }
}
```

### ChatGPT / OpenAI

Use the OpenAI Response API with MCP support:

```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...],
  tools: [{
    type: "mcp",
    mcp: {
      url: "https://mcp.supabase.com/mcp?project=xptonqqagxcpzlgndilj"
    }
  }]
});
```

## Troubleshooting

### Authentication Issues

If OAuth2 fails:

1. Clear browser cookies for `supabase.com`
2. Try incognito/private browsing mode
3. Check that you're logged into the correct Supabase account

### Connection Issues

If the MCP server doesn't connect:

1. Verify the URL is correct
2. Check your internet connection
3. Try without query parameters first
4. Check MCP client logs for errors

### Local Instance Not Working

If local MCP doesn't work:

1. Ensure `supabase start` is running
2. Verify port 54321 is not blocked
3. Check `supabase status` for service health
4. Try restarting: `supabase stop && supabase start`

## Migration from Old Setup

If you were using the old `stdio` MCP server:

### Before (stdio)

```json
{
  "supabase": {
    "type": "local",
    "command": ["npx", "-y", "@supabase/mcp-server-supabase"],
    "environment": {
      "SUPABASE_ACCESS_TOKEN": "sbp_xxx..."
    }
  }
}
```

### After (remote)

```json
{
  "supabase": {
    "type": "remote",
    "url": "https://mcp.supabase.com/mcp?project=xptonqqagxcpzlgndilj"
  }
}
```

**Benefits:**
- No Node.js required
- No manual token management
- Works with more AI clients
- Better error messages
- Faster and more reliable

## Next Steps

1. **Test the connection** - Try listing your projects
2. **Explore documentation search** - Use `search_docs` to find Supabase info
3. **Run security advisors** - Use `get_advisors` to check your database
4. **Deploy Edge Functions** - Use MCP to deploy functions from your AI client

## Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Supabase Remote MCP Announcement](https://supabase.com/blog/remote-mcp-server)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [DIBEA Supabase Reference](./DIBEA_SUPABASE_REFERENCE.md)

## Support

For issues or questions:

1. Check the [Supabase Discord](https://discord.supabase.com)
2. Review [GitHub Issues](https://github.com/supabase-community/supabase-mcp/issues)
3. Consult the [MCP Spec](https://modelcontextprotocol.io/)

