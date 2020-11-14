import { getBoeIds } from '@common/Constants'
import { IConnectedRealmCache } from '@common/ICache'
import { IAuctionsResponse, IConnectedRealmResponse } from './API'
import { APIAccessor } from './APIAccessor'
import { ItemAuction } from './ItemAuctions'
import { Realm } from './Realm'
import { Region } from './Region'

export class ConnectedRealm {
    readonly connectedRealmAccessor: APIAccessor
    readonly auctionsAccessor: APIAccessor

    readonly region: Region
    readonly id: number
    realms: Array<Realm>
    auctions: Array<ItemAuction>

    constructor(region: Region, id: number) {
        const connectedRealmEndpoint = `${region.config.apiHost}/data/wow/connected-realm/${id}`
        this.connectedRealmAccessor = new APIAccessor(connectedRealmEndpoint, true, region)

        const auctionsEndpoint = `${region.config.apiHost}/data/wow/connected-realm/${id}/auctions`
        this.auctionsAccessor = new APIAccessor(auctionsEndpoint, true, region)

        this.region = region
        this.id = id
        this.realms = []
        this.auctions = []
    }

    export(): IConnectedRealmCache {
        const cachedConnectedRealm: IConnectedRealmCache = {
            id: this.id,
            realms: [],
        }

        for (const realm of this.realms) {
            cachedConnectedRealm.realms.push(realm.export())
        }

        return cachedConnectedRealm
    }

    async fetch(): Promise<void> {
        await this.connectedRealmAccessor.fetch(this.onReceiveData)
    }

    async fetchAuctions(): Promise<void> {
        // Even if fetching auctions for this server fails, the script can still proceed
        // and just treat this realm as having 0 auctions until next scheduled run
        try {
            await this.auctionsAccessor.fetch(this.onReceiveAuctionsData)
        } catch (err) {
            console.warn(`Failed to get auctions for ${this.toString()}`, err)
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    private onReceiveData = async(response: unknown): Promise<void> => {
        const data = response as IConnectedRealmResponse

        for (const { id, name } of data.realms) {
            const realm = new Realm(this.region, id, name)
            this.realms.push(realm)
        }

        console.debug(`Fetched ${this.toString()}`)
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    private onReceiveAuctionsData = async(response: unknown): Promise<void> => {
        const data = response as IAuctionsResponse
        const boeIds: Array<number> = getBoeIds()

        if (!data.auctions) {
            console.warn(`No auctions found for ${this.toString()}`)
            return
        }

        for (const auctionResponse of data.auctions) {
            const itemId = auctionResponse.item.id
            if (!boeIds.includes(itemId)) {
                continue
            }

            const id = auctionResponse.id
            const buyout = Math.round((auctionResponse.buyout || 0) / (100 * 100)) // 1 gold = 100 silver * 100 copper/silver
            const bonuses = auctionResponse.item.bonus_lists || []

            if (buyout > 0) {
                const auction = new ItemAuction(id, this.id, itemId, buyout, bonuses)
                this.auctions.push(auction)
            }
        }

        console.debug(`Fetched ${this.auctions.length.toString().padStart(4, ' ')} auctions from ${this.toString()}`)
    }

    toString(): string {
        return `${this.region.toString()} ConnectedRealm:${this.id.toString().padStart(4, ' ')} ${this.realms.map((realm) => realm.name).join(', ')}`
    }
}
