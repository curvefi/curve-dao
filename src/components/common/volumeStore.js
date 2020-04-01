import Vue from 'vue'
import abis from '../../allabis'

export const state = Vue.observable({
	volumes: {
		compound: -1,
		usdt: -1,
		iearn: -1,
		busd: -1,
	},
	allVolume: {
		compound: [],
		usdt: [],
		iearn: [],
		busd: [],
	}
})

export async function getVolumes(pools, refresh = false) {
	if(!Array.isArray(pools)) pools = [pools]
	if(Object.values(state.volumes).filter(v=>v!=-1).length == pools.length && !refresh) return;
	let volumes = pools.map(p => fetch(`https://beta.curve.fi/raw-stats/${p == 'iearn' ? 'y' : p}-5m.json`))
	volumes = await Promise.all(volumes)
	for(let i = 0; i < volumes.length; i++) {
    	let json = await volumes[i].json();
		let pool = pools[i] == 'y' ? 'iearn' : pools[i]
    	let sum = 0;
    	for(let data of json.slice(-288)) {
    		sum += Object.entries(data.volume).map(([k, v]) => {
    			let precisions = abis[pool].coin_precisions[k.split('-')[0]]
    			return v[0] / precisions
    		}).reduce((a, b) => a + b, 0);
    	}
    	state.volumes[pool] = sum;
    }
}

export async function getDailyVolume(pool, refresh = false) {
	if(state.allVolume[pool].length && !refresh) return;
	pool = pool == 'iearn' ? 'y' : pool
	let pools = [pool]
	let volumes = pools.map(p => fetch(`https://beta.curve.fi/raw-stats/${pool}-30m.json`))
	volumes = await Promise.all(volumes)
	for(let i = 0; i < volumes.length; i++) {
		let json = await volumes[i].json();
		pool = pools[i] == 'y' ? 'iearn' : pools[i]
		for(let data of json) {
			state.allVolume[pool].push([
				data.timestamp * 1000,
				Object.entries(data.volume).map(([k, v]) => {
	    			let precisions = abis[pool].coin_precisions[k.split('-')[0]]
	    			return v[0] / precisions
	    		}).reduce((a, b) => a + b, 0)
			])
		}
	}
}

export function totalVolume() {
	return Object.values(state.volumes).reduce((a, b) => a + b, 0)
}