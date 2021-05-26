const playerTokens = canvas.tokens.controlled.filter(token => token?.actor?.hasPlayerOwner);

if (playerTokens.length > 0) {
	new Dialog({
		title: 'Set Inspire',
		content:
			`<form id="setInspire">
				<div class="form-group"><label>Effect:</label><div class="form-fields"><select name="effect"><option value="courage">Inspire Courage</option><option value="defense">Inspire Defense</option></select></div></div>
				<div class="form-group"><label>Duration:</label><div class="form-fields"><select name="duration"><option value="1">1</option><option value="3">3</option><option value="4">4</option></select></div></div>
				<div class="form-group"><label>Value:</label><div class="form-fields"><select name="value"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></div></div>
			</form>`,
		buttons: {
			set: {
				label: 'Set',
				callback: (html) => Promise.resolve(setEffect(html, playerTokens)),
			},
			remove: {
				label: 'Remove All',
				callback: () => Promise.resolve(removeEffects(playerTokens)),
			},                
		},
		default: 'set',
		}, {
			width: 230,
			height: 170
		}).render(true);
} else {
	ui.notifications.warn('Please select one or more player character tokens!');
}

async function setEffect(html, tokens) {
	const compendiumPackName = 'pf2e.spell-effects';
	
	const effectNames = {
		'courage': { 
			1: 'Spell Effect: Inspire Courage',
			2: 'Spell Effect: Inspire Heroics (Courage, +2)',
			3: 'Spell Effect: Inspire Heroics (Courage, +3)'
		},
		'defense': {
			1: 'Spell Effect: Inspire Defense',
			2: 'Spell Effect: Inspire Heroics (Defense, +2)',
			3: 'Spell Effect: Inspire Heroics (Defense, +3)'
		}
	};

    const effect = html.find('select[name=effect] option:selected').val();	
    const value = parseInt(html.find('select[name=value] option:selected').val());

	const pack = game.packs.get(compendiumPackName);
	
	const effectId = pack.getIndex().then((index) => {
		return index.find(e => e.name === effectNames[effect][value])._id;
	});

    const duration = parseInt(html.find('select[name=duration] option:selected').val());
	
	return Promise.all(tokens.map(async (token) => {
		return pack.getEntry(await effectId).then(async (effect) => {
			effect.data.duration.value = duration;
			return token.actor.createOwnedItem(effect);
		});
	}));
}

async function removeEffects(tokens) {
	return Promise.all(tokens.map(async (token) => {
		const effectList = token.actor.items.filter(i => i.type === 'effect' && i.name.startsWith('Spell Effect: Inspire')).map(effect => effect.id);
		return token.actor.deleteEmbeddedEntity("OwnedItem", effectList);
	}));
}