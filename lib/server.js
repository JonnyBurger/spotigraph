const express = require('express');
const {sortBy, min} = require('lodash');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const {ask} = require('./graph-api');

app.use(bodyParser.json());
app.use(cors());

app.post('/', async (request, response) => {
	try {
		const {one, two} = request.body;
		const data = await ask({artist1: one, artist2: two}); // TODO: Escaping and checking if exists
		const nicer = data.records.map(r => {
			return r._fields[0];
		});
		const minConnections = min(nicer.map(r => r.segments.length));
		// Prefer chains where every artist has an image
		const imageSorted = sortBy(
			nicer.filter(r => r.segments.length === minConnections),
			r =>
				r.segments.filter(
					s =>
						s.start.properties.image && s.start.properties.image !== 'undefined'
				).length
		).reverse();
		response.json({success: true, data: imageSorted[0]});
	} catch (err) {
		response.json({
			success: false,
			error: err.message
		});
	}
});

app.listen(process.env.PORT || 7000);
console.log('Started server.');