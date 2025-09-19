import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { makeApiCall } from './api.js';
import { EntityManager } from './entityManager.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js';

const entityManager = new EntityManager();
// PAGINATION: Define a default page size to prevent oversized payloads.
const DEFAULT_PAGE_SIZE = 5;

// Helper function to safely send notifications
async function safeNotification(context: RequestHandlerExtra<ServerRequest, ServerNotification>, notification: any): Promise<void> {
    try {
        await context.sendNotification(notification);
    } catch (error) {
        console.log('Notification failed (this is normal in test environments):', error);
    }
}

// Helper function to build the OData $filter string from an object
function buildFilterString(filterObject?: Record<string, string>): string | null {
    if (!filterObject || Object.keys(filterObject).length === 0) {
        return null;
    }
    const filterClauses = Object.entries(filterObject).map(([key, value]) => {
        return `${key} eq '${value}'`;
    });
    return filterClauses.join(' and ');
}


// --- Zod Schemas for Tool Arguments ---



const createLegalEntitieSchema = z.object({
    legalEntityData: z.record(z.unknown()).describe("A JSON object for the new legal entity. Must include name, company, etc."),
});

const createCustomerSchema = z.object({
    customerData: z.record(z.unknown()).describe("A JSON object for the new customer. Must include dataAreaId, CustomerAccount, etc."),
});

const createCustomerGroupSchema = z.object({
    customerGroupData: z.record(z.unknown()).describe("A JSON object for the new customer group. Must include dataAreaId, customer group id, etc."),
});


const createVendorGroupSchema = z.object({
    vendorGroupData: z.record(z.unknown()).describe("A JSON object for the new customer group. Must include dataAreaId, vendor group id, etc."),
});


/**
 * Creates and configures the MCP server with all the tools for the D365 API.
 * @returns {McpServer} The configured McpServer instance. 
 */
export const getServer = (): McpServer => {
    const server = new McpServer({
        name: 'd365-fno-mcp-server',
        version: '1.0.0',
    });

    // --- Tool Definitions ---

  

      server.tool(
        'createCustomerGroup',
        'Creates a new customer group record in CustCUstomerGroup.',
        createCustomerGroupSchema.shape,
        async ({ customerGroupData }: z.infer<typeof createCustomerGroupSchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
            const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/CustomerGroups`;
            return makeApiCall('POST', url, customerGroupData as Record<string, unknown>, async (notification) => {
                await safeNotification(context, notification);
            });
        }
    );

     server.tool(
        'createVendorGroup',
        'Creates a new vendor group record in VendorGroups.',
        createVendorGroupSchema.shape,
        async ({ vendorGroupData }: z.infer<typeof createVendorGroupSchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
            const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/VendorGroups`;
            return makeApiCall('POST', url, vendorGroupData as Record<string, unknown>, async (notification) => {
                await safeNotification(context, notification);
            });
        }
    );

      server.tool(
        'createLegalEntity',
        'Creates a new legal entity record in Legal entities.',
        createLegalEntitieSchema.shape,
        async ({ legalEntityData }: z.infer<typeof createLegalEntitieSchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
            const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/LegalEntities`;
            return makeApiCall('POST', url, legalEntityData as Record<string, unknown>, async (notification) => {
                await safeNotification(context, notification);
            });
        }
    );


  


    return server;
};






