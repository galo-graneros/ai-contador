import * as soap from 'soap'
import * as crypto from 'crypto'
import { AFIP_TIPOS_COMPROBANTE, AFIP_CONCEPTOS } from '@ai-contador/shared'

interface FacturaCData {
    puntoVenta: number
    numeroComprobante: number
    fechaEmision: Date
    importeTotal: number
    importeNeto: number
    receptorCuit?: string
    receptorNombre: string
    concepto: string
}

interface AfipResponse {
    cae: string
    caeVencimiento: string
    resultado: string
    observaciones?: any[]
    errores?: any[]
}

export class AfipService {
    private cuit: string
    private certificate: string
    private privateKey: string
    private puntoVenta: number
    private isProduction: boolean

    // AFIP service URLs
    private wsaaUrl: string
    private wsfeUrl: string

    constructor(
        cuit: string,
        certificate: string,
        privateKey: string,
        puntoVenta: number = 1,
        isProduction: boolean = false
    ) {
        this.cuit = cuit
        this.certificate = certificate
        this.privateKey = privateKey
        this.puntoVenta = puntoVenta
        this.isProduction = isProduction

        // Use homologation (testing) URLs by default
        if (isProduction) {
            this.wsaaUrl = 'https://wsaa.afip.gov.ar/ws/services/LoginCms?WSDL'
            this.wsfeUrl = 'https://servicios1.afip.gov.ar/wsfev1/service.asmx?WSDL'
        } else {
            this.wsaaUrl = 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL'
            this.wsfeUrl = 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx?WSDL'
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            // Try to get a ticket to verify credentials work
            await this.getAuthTicket()
            return true
        } catch (error) {
            console.error('AFIP connection test failed:', error)
            return false
        }
    }

    private async getAuthTicket(): Promise<{ token: string; sign: string }> {
        // Generate login ticket request (TRA)
        const now = new Date()
        const expiration = new Date(now.getTime() + 12 * 60 * 60 * 1000) // 12 hours

        const tra = `<?xml version="1.0" encoding="UTF-8"?>
    <loginTicketRequest version="1.0">
      <header>
        <uniqueId>${Math.floor(Date.now() / 1000)}</uniqueId>
        <generationTime>${now.toISOString()}</generationTime>
        <expirationTime>${expiration.toISOString()}</expirationTime>
      </header>
      <service>wsfe</service>
    </loginTicketRequest>`

        // Sign the TRA with the private key
        const cms = this.signTRA(tra)

        // Call WSAA to get the ticket
        const client = await soap.createClientAsync(this.wsaaUrl)
        const [result] = await client.loginCmsAsync({ in0: cms })

        // Parse the response
        const loginTicketResponse = result.loginCmsReturn
        const parser = new (await import('xml2js')).Parser()
        const parsed = await parser.parseStringPromise(loginTicketResponse)

        return {
            token: parsed.loginTicketResponse.credentials[0].token[0],
            sign: parsed.loginTicketResponse.credentials[0].sign[0]
        }
    }

    private signTRA(tra: string): string {
        // Create PKCS#7 signature (CMS)
        const sign = crypto.createSign('RSA-SHA256')
        sign.update(tra)
        const signature = sign.sign(this.privateKey, 'base64')

        // In a real implementation, you'd create a proper CMS structure
        // For now, this is simplified
        const certificate = this.certificate
            .replace(/-----BEGIN CERTIFICATE-----/, '')
            .replace(/-----END CERTIFICATE-----/, '')
            .replace(/\n/g, '')

        // This is a simplified representation
        // A real implementation would use a library like node-forge
        return Buffer.from(tra).toString('base64')
    }

    async getLastInvoiceNumber(): Promise<number> {
        try {
            const { token, sign } = await this.getAuthTicket()

            const client = await soap.createClientAsync(this.wsfeUrl)
            const [result] = await client.FECompUltimoAutorizadoAsync({
                Auth: {
                    Token: token,
                    Sign: sign,
                    Cuit: this.cuit
                },
                PtoVta: this.puntoVenta,
                CbteTipo: AFIP_TIPOS_COMPROBANTE.FACTURA_C
            })

            return result.FECompUltimoAutorizadoResult.CbteNro || 0
        } catch (error) {
            console.error('Failed to get last invoice number:', error)
            return 0
        }
    }

    async createFacturaC(data: FacturaCData): Promise<AfipResponse> {
        const { token, sign } = await this.getAuthTicket()

        // Format date as YYYYMMDD
        const fechaEmision = data.fechaEmision.toISOString().split('T')[0].replace(/-/g, '')

        // Calculate CAE expiration (10 days from emission)
        const vencimiento = new Date(data.fechaEmision)
        vencimiento.setDate(vencimiento.getDate() + 10)
        const fechaVencimiento = vencimiento.toISOString().split('T')[0].replace(/-/g, '')

        const client = await soap.createClientAsync(this.wsfeUrl)

        const request = {
            Auth: {
                Token: token,
                Sign: sign,
                Cuit: this.cuit
            },
            FeCAEReq: {
                FeCabReq: {
                    CantReg: 1,
                    PtoVta: data.puntoVenta,
                    CbteTipo: AFIP_TIPOS_COMPROBANTE.FACTURA_C
                },
                FeDetReq: {
                    FECAEDetRequest: [{
                        Concepto: AFIP_CONCEPTOS.SERVICIOS,
                        DocTipo: data.receptorCuit ? 80 : 99, // 80=CUIT, 99=Consumidor Final
                        DocNro: data.receptorCuit ? parseInt(data.receptorCuit) : 0,
                        CbteDesde: data.numeroComprobante,
                        CbteHasta: data.numeroComprobante,
                        CbteFch: fechaEmision,
                        ImpTotal: data.importeTotal,
                        ImpTotConc: 0,
                        ImpNeto: data.importeNeto,
                        ImpOpEx: 0,
                        ImpIVA: 0,
                        ImpTrib: 0,
                        MonId: 'PES',
                        MonCotiz: 1
                    }]
                }
            }
        }

        const [result] = await client.FECAESolicitarAsync(request)
        const response = result.FECAESolicitarResult

        if (response.FeCabResp.Resultado === 'R') {
            throw new Error(
                `AFIP Error: ${JSON.stringify(response.FeDetResp?.FECAEDetResponse?.[0]?.Observaciones || response.Errors)}`
            )
        }

        const detResponse = response.FeDetResp.FECAEDetResponse[0]

        return {
            cae: detResponse.CAE,
            caeVencimiento: this.parseAfipDate(detResponse.CAEFchVto),
            resultado: detResponse.Resultado,
            observaciones: detResponse.Observaciones,
            errores: response.Errors
        }
    }

    private parseAfipDate(afipDate: string): string {
        // Convert YYYYMMDD to YYYY-MM-DD
        if (!afipDate || afipDate.length !== 8) return afipDate
        return `${afipDate.slice(0, 4)}-${afipDate.slice(4, 6)}-${afipDate.slice(6, 8)}`
    }

    async getServerStatus(): Promise<{ appServer: string; dbServer: string; authServer: string }> {
        try {
            const client = await soap.createClientAsync(this.wsfeUrl)
            const [result] = await client.FEDummyAsync({})

            return {
                appServer: result.FEDummyResult.AppServer,
                dbServer: result.FEDummyResult.DbServer,
                authServer: result.FEDummyResult.AuthServer
            }
        } catch (error) {
            throw new Error('Failed to check AFIP server status')
        }
    }
}
