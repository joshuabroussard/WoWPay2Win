import Constants, { getBoeIds, RegionConfigs } from '@common/Constants'
import { batchRequests } from '@common/utils'
import { Item } from './models/Item'
import { Region } from './models/Region'

async function fetchRegions() {
    const regions: Array<Region> = []

    for (const regionConfig of RegionConfigs) {
        const region = new Region(regionConfig)
        await region.fetch()
        regions.push(region)
    }

    return regions
}

async function fetchItems(region: Region) {
    const boeIds = getBoeIds()

    await batchRequests(boeIds.length, async(idx) => {
        const item = new Item(region, boeIds[idx])
        await item.fetch()
    })
}

async function main() {
    try {
        const regions = await fetchRegions()

        for (const region of regions) {
            await fetchItems(region)
        }

        console.info('Cron Script Finished')
    } catch (err) {
        const error = err as Error
        console.error('Cron Script Failed:', error.message)
        if (Constants.IS_DEV) {
            console.error(error.stack)
        }
        process.exit(1)
    }
}

void main()
