/**
 * MCP (Model Context Protocol) Server
 * Allows AI assistants to access tools, resources, and context
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

class PSSIMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'pssi-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'execute_command',
          description: 'Execute a shell command on Windows',
          inputSchema: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'The PowerShell command to execute',
              },
            },
            required: ['command'],
          },
        },
        {
          name: 'read_file',
          description: 'Read the contents of a file',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'The file path to read',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'write_file',
          description: 'Write content to a file',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'The file path to write to',
              },
              content: {
                type: 'string',
                description: 'The content to write',
              },
            },
            required: ['path', 'content'],
          },
        },
        {
          name: 'list_directory',
          description: 'List files and directories in a path',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'The directory path to list',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'system_info',
          description: 'Get system information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'search_files',
          description: 'Search for files matching a pattern',
          inputSchema: {
            type: 'object',
            properties: {
              directory: {
                type: 'string',
                description: 'The directory to search in',
              },
              pattern: {
                type: 'string',
                description: 'The search pattern (glob)',
              },
            },
            required: ['directory', 'pattern'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'execute_command':
            return await this.executeCommand(args.command as string);
          case 'read_file':
            return await this.readFile(args.path as string);
          case 'write_file':
            return await this.writeFile(args.path as string, args.content as string);
          case 'list_directory':
            return await this.listDirectory(args.path as string);
          case 'system_info':
            return await this.getSystemInfo();
          case 'search_files':
            return await this.searchFiles(args.directory as string, args.pattern as string);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'pssi://system/info',
          name: 'System Information',
          mimeType: 'application/json',
          description: 'Current system information and status',
        },
        {
          uri: 'pssi://config/settings',
          name: 'PSSI Configuration',
          mimeType: 'application/json',
          description: 'PSSI configuration and settings',
        },
      ],
    }));

    // Read resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;

      if (uri === 'pssi://system/info') {
        const info = await this.getSystemInfo();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  private async executeCommand(command: string) {
    const { stdout, stderr } = await execAsync(command, {
      shell: 'powershell.exe',
      windowsHide: true,
    });

    return {
      content: [
        {
          type: 'text',
          text: stdout || stderr || 'Command executed successfully',
        },
      ],
    };
  }

  private async readFile(filePath: string) {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  }

  private async writeFile(filePath: string, content: string) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: `File written successfully: ${filePath}`,
        },
      ],
    };
  }

  private async listDirectory(dirPath: string) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const result = entries.map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async getSystemInfo() {
    const info = {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      nodeVersion: process.version,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(info, null, 2),
        },
      ],
    };
  }

  private async searchFiles(directory: string, pattern: string) {
    const { stdout } = await execAsync(
      `Get-ChildItem -Path "${directory}" -Filter "${pattern}" -Recurse | Select-Object FullName`,
      { shell: 'powershell.exe' }
    );

    return {
      content: [
        {
          type: 'text',
          text: stdout,
        },
      ],
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('PSSI MCP Server running on stdio');
  }
}

// Start the server
const server = new PSSIMCPServer();
server.start().catch(console.error);
