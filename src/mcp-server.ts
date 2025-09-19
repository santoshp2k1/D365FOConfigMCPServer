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

const createFiscalCalendarSchema = z.object({
    fiscalCalendarData: z.record(z.unknown()).describe("A JSON object for the new Fiscal calendar. Must include CalendardId, etc."),
});

const createFiscalCalendarYearSchema = z.object({
    fiscalCalendarYearData: z.record(z.unknown()).describe("A JSON object for the new Fiscal calendar year. Must include FiscalCalendar_CalendardId, StartDate, EndDate,  etc."),
});

const createFiscalCalendarPeriodchema = z.object({
    fiscalCalendarPeriodData: z.record(z.unknown()).describe("A JSON object for the new Fiscal calendar period. Must include FiscalCalendarYear, Name, StartDate etc."),
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

const createChartOfAccountsSchema = z.object({
    chartOfAccountsData: z.record(z.unknown()).describe("A JSON object for the new Chart of Accounts. Must include  ChartOfAccountsId, etc."),
});

const createMainAccountSchema = z.object({
    mainAccountData: z.record(z.unknown()).describe("A JSON object for the new Main Account. Must include Name, ChartOfAccounts, MainAccountId."),
});


const createCurrencySchema = z.object({
    currencyData: z.record(z.unknown()).describe("A JSON object for the new Currency. Must include CurrencyCode."),
});


const createExchangeRateSchema = z.object({
    exchangeRateData: z.record(z.unknown()).describe("A JSON object for the new Exchange Rate. Must include ExchangeRateForStorage."),
});


const createLedgerJournalNameSchema = z.object({
    ledgerJournalNameData: z.record(z.unknown()).describe("A JSON object for the new Ledger Journal Name. Must include VoucherSeriesCode ,Name, dataAreaId "),
});


const createFinancialDimensionSchema = z.object({
    financialDimensionData: z.record(z.unknown()).describe("A JSON object for the new Financial Dimension. Must include DimensionName."),
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

    server.tool(
            'createFiscalCalendar',
            'Creates a new Fiscal Calendar record ',
            createFiscalCalendarSchema.shape,
            async ({ fiscalCalendarData }: z.infer<typeof createFiscalCalendarSchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
                const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/FiscalCalendarsEntity`;
                return makeApiCall('POST', url, fiscalCalendarData as Record<string, unknown>, async (notification) => {
                    await safeNotification(context, notification);
                });
            }
        );
  
    server.tool(
            'createFiscalCalendarYear',
            'Creates a new Fiscal Calendar Year record ',
            createFiscalCalendarYearSchema.shape,
            async ({ fiscalCalendarYearData }: z.infer<typeof createFiscalCalendarYearSchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
                const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/FiscalCalendarYearsEntity`;
                return makeApiCall('POST', url, fiscalCalendarYearData as Record<string, unknown>, async (notification) => {
                    await safeNotification(context, notification);
                });
            }
        );

        server.tool(
            'createFiscalCalendarPeriod',
            'Creates a new Fiscal Calendar Period record ',
            createFiscalCalendarPeriodchema.shape,
            async ({ fiscalCalendarPeriodData }: z.infer<typeof createFiscalCalendarPeriodchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
                const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/FiscalCalendarPeriodBiEntities`;
                return makeApiCall('POST', url, fiscalCalendarPeriodData as Record<string, unknown>, async (notification) => {
                    await safeNotification(context, notification);
                });
            }
        );



server.tool(
    'createChartOfAccounts',
    'Creates a new Chart of Accounts record in ChartOfAccounts.',
    createChartOfAccountsSchema.shape,
    async ({ chartOfAccountsData }: z.infer<typeof createChartOfAccountsSchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
        const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/ChartOfAccounts`;
        return makeApiCall('POST', url, chartOfAccountsData as Record<string, unknown>, async (notification) => {
            await safeNotification(context, notification);
        });
    }
);

server.tool(
    'createMainAccount',
    'Creates a new Main Account record in MainAccounts.',
    createMainAccountSchema.shape,
    async ({ mainAccountData }: z.infer<typeof createMainAccountSchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
        const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/MainAccounts`;
        return makeApiCall('POST', url, mainAccountData as Record<string, unknown>, async (notification) => {
            await safeNotification(context, notification);
        });
    }


server.tool(
    'createCurrency',
    'Creates a new Currency record in Currencies.',
    createCurrencySchema.shape,
    async ({ currencyData }: z.infer<typeof createCurrencySchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
        const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/Currencies`;
        return makeApiCall('POST', url, currencyData as Record<string, unknown>, async (notification) => {
            await safeNotification(context, notification);
        });
    }
);


server.tool(
    'createExchangeRate',
    'Creates a new Exchange Rate record in ExchangeRates.',
    createExchangeRateSchema.shape,
    async ({ exchangeRateData }: z.infer<typeof createExchangeRateSchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
        const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/ExchangeRates`;
        return makeApiCall('POST', url, exchangeRateData as Record<string, unknown>, async (notification) => {
            await safeNotification(context, notification);
        });
    }
);


server.tool(
    'createLedgerJournalName',
    'Creates a new Ledger Journal Name record in JournalNames.',
    createLedgerJournalNameSchema.shape,
    async ({ ledgerJournalNameData }: z.infer<typeof createLedgerJournalNameSchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
        const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/JournalNames`;
        return makeApiCall('POST', url, ledgerJournalNameData as Record<string, unknown>, async (notification) => {
            await safeNotification(context, notification);
        });
    }
);


server.tool(
    'createFinancialDimension',
    'Creates a new Financial Dimension record in DimensionAttributes.',
    createFinancialDimensionSchema.shape,
    async ({ financialDimensionData }: z.infer<typeof createFinancialDimensionSchema>, context: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
        const url = `${process.env.DYNAMICS_RESOURCE_URL}/data/DimensionAttributes`;
        return makeApiCall('POST', url, financialDimensionData as Record<string, unknown>, async (notification) => {
            await safeNotification(context, notification);
        });
    }
    
    return server;
};







