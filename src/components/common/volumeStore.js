import Vue from 'vue'
import abis from '../../allabis'

export const state = Vue.observable({
	volumes: {
		compound: -1,
		usdt: -1,
		y: -1,
		busd: -1,
		susd: -1,
	},
	volumeData: {
		5: {
			compound: [],
			usdt: [],
			y: [],
			busd: [],
			susd: [],
		},
		30: {
			compound: [],
			usdt: [],
			y: [],
			busd: [],
			susd: [],
		},
		1440: {
			compound: [],
			usdt: [],
			y: [],
			busd: [],
			susd: [],
		}
	},
	allVolume: {
		compound: [],
		usdt: [],
		y: [],
		busd: [],
		susd: [],
	}
})


export async function fetchVolumeData(pools, refresh = false, period = 5) {
	if(!Array.isArray(pools)) pools = [pools]
	pools = pools.map(p => p == 'iearn' ? 'y' : p == 'susdv2' ? 'susd' : p)
	pools = pools.filter(pool => !state.volumeData[period][pool].length)
	let requests = pools.map(p => fetch(`https://beta.curve.fi/raw-stats/${p}-${period}m.json`))
	requests = await Promise.all(requests)
	let jsons = await Promise.all(requests.map(r => r.json()))
	for(let [i, data] of jsons.entries()) {
		state.volumeData[period][pools[i]] = data
	}
}

export async function getVolumes(pools, refresh = false) {
	if(!Array.isArray(pools)) pools = [pools]
	pools = pools.map(p => p == 'iearn' ? 'y' : p == 'susdv2' ? 'susd' : p)
	if(Object.values(state.volumes).filter(v=>v!=-1).length == pools.length && !refresh) return;
	let stats = await fetch(`https://beta.curve.fi/raw-stats/apys.json`)
    stats = await stats.json()
    state.volumes = stats.volume;
}

export async function getDailyVolume(pool, refresh = false) {
	pool = pool == 'iearn' ? 'y' : pool == 'susdv2' ? 'susd' : pool

	if(state.allVolume[pool].length && !refresh) return;
	await fetchVolumeData(pool, refresh, 30)
	let json = state.volumeData[30][pool];
	state.volumeData[pool] = json
	for(let data of json) {
		state.allVolume[pool].push([
			data.timestamp * 1000,
			Object.entries(data.volume).map(([k, v]) => {
    			let precisions = abis[pool == 'susd' ? 'susdv2' : pool].coin_precisions[k.split('-')[0]]
    			return v[0] / precisions
    		}).reduce((a, b) => a + b, 0)
		])
	}
}


export async function getLendingAPY(pool, refresh = false) {
	pool = pool == 'iearn' ? 'y' : pool == 'susdv2' ? 'susd' : pool
	if(!state.volumeData[30][pool].length)
		await fetchVolumeData(pool, refresh, 30)

	let lendingrates = []

	for(let j = 48; j < state.volumeData[30][pool].length; j += 4) {
		let json = state.volumeData[30][pool]
		let data = json[j]
		let prevdata = json[j-48]
		let balances = data.balances.map((b,bi)=>b /= abis[pool == 'susd' ? 'susdv2' : pool].coin_precisions[bi])
		let apdrate = data.rates.map((rate, k) => {
			return (rate / prevdata.rates[k]) - 1
		})
		let balancesp = balances.map((b, bi) => b *= apdrate[bi])
		let sump = balancesp.reduce((a,b) => a + b, 0)
		let sumbalances = balances.reduce((a, b) => a + b, 0)
		let apd = sump / sumbalances
		let apdy = (1 + apd) ** 365
		lendingrates.push([
			data.timestamp * 1000,
			(apdy - 1) * 100
		])
	}

	return lendingrates;

}

export function totalVolume() {
	return Object.values(state.volumes).filter(v=>v!=-1).length == 5 ? Object.values(state.volumes).reduce((a, b) => a + b, 0) : -1
}