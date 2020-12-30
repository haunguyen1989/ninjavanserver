require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 4000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });

const render = require('./lib/render');
const router = require('@koa/router')();
const koaBody = require('koa-body');

global.posts = [
    {title: 'Title', body: 'Contents'},
    {title: 'Title2', body: 'Contents2'},
    {title: 'Title3', body: 'Contents3'},
    {title: 'Title4', body: 'Contents4'}
];


app.prepare().then(() => {

    const server = new Koa();
    // middleware
    server.use(render);
    server.use(koaBody());

    // route definitions


    router.get('/', list)
        .get('/post/new', add)
        .get('/post/:id', show)
        .post('/post', create)
        .post('/VN/2.0/oauth/access_token', access_token)
        .post('/VN/4.1/orders', create_order);

    server.use(router.routes());

    /**
     * Post listing.
     */

    async function list(ctx) {

        await ctx.render('list', { posts: posts });
    }

    /**
     * Show creation form.
     */

    async function add(ctx) {
        await ctx.render('new');
    }

    /**
     * Show post :id.
     */

    async function show(ctx) {
        const id = ctx.params.id;
        const post = posts[id];
        if (!post) ctx.throw(404, 'invalid post id');
        await ctx.render('show', { post: post });
    }

    /**
     * Create a post.
     */

    async function create(ctx) {
        const post = ctx.request.body;
        console.log(post);
        const id = posts.push(post) - 1;
        post.created_at = new Date();
        post.id = id;
        ctx.redirect('/');
    }

    async function access_token(ctx) {
        console.log('GET access_token ok');
        console.log(ctx.request.body);

        const posts =
            {
                "access_token": "YOUR_access_token",
                "expires": 1,
                "expires_in": 300,
                "token_type": "bearer"
            }
        ;

        ctx.response.status = 200;
        ctx.response.body = posts;
    }


    async function create_order(ctx) {

        console.log('GET create_order');
        const bodyData = ctx.request.body;
        console.log(bodyData);
        const service_type = ctx.request.body.service_type;
        const service_level = ctx.request.body.service_level;

        const tracking_number = Math.floor(
            Math.random() * (1000000000 - 10000000) + 10000000
        );
        const posts = {
            "service_type": service_type,
            "service_level": service_level,
            "tracking_number": tracking_number,
            "requested_tracking_number": "1234-56789",
            "reference": {
                "merchant_order_number": "SHIP-1234-56789"
            },
            "from": {
                "name": "John Doe",
                "phone_number": "+60122222222",
                "email": "john.doe@gmail.com",
                "address": {
                    "address1": "17 Lorong Jambu 3",
                    "address2": "",
                    "area": "Taman Sri Delima",
                    "city": "Simpang Ampat",
                    "state": "Pulau Pinang",
                    "country": "MY",
                    "postcode": "51200"
                }
            },
            "to": {
                "name": "Jane Doe",
                "phone_number": "+6212222222222",
                "email": "jane.doe@gmail.com",
                "address": {
                    "address1": "Gedung Balaikota DKI Jakarta",
                    "address2": "Jalan Medan Merdeka Selatan No. 10",
                    "kelurahan": "Kelurahan Gambir",
                    "kecamatan": "Kecamatan Gambir",
                    "city": "Jakarta Selatan",
                    "province": "Jakarta",
                    "country": "ID",
                    "postcode": "10110"
                }
            },
            "parcel_job": {
                "is_pickup_required": true,
                "pickup_address_id": 98989012,
                "pickup_service_type": "Scheduled",
                "pickup_service_level": "Premium",
                "pickup_date": "2018-01-18T00:00:00.000Z",
                "pickup_timeslot": {
                    "start_time": "09:00",
                    "end_time": "12:00",
                    "timezone": "Asia/Singapore"
                },
                "pickup_instructions": "Pickup with care!",
                "delivery_instructions": "If recipient is not around, leave parcel in power riser.",
                "delivery_start_date": "2018-01-19",
                "delivery_timeslot": {
                    "start_time": "09:00",
                    "end_time": "22:00",
                    "timezone": "Asia/Singapore"
                }
            }
        };
        ctx.response.status = 200;
        ctx.response.body = posts;
    }

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});
