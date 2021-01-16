const dotenv = require('dotenv');
const Koa = require('koa');
const { AwakeHeroku } = require("awake-heroku");
const crypto = require("crypto");

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 4000;

const render = require('./lib/render');
const router = require('@koa/router')();
const koaBody = require('koa-body');

global.posts = [
    {title: 'Title', body: 'Contents'},
    {title: 'Title2', body: 'Contents2'},
    {title: 'Title3', body: 'Contents3'},
    {title: 'Title4', body: 'Contents4'}
];

const app = module.exports = new Koa();

// middleware
app.use(render);
app.use(koaBody());
app.use(router.routes());
// route definitions


router.get('/', list)
    .get('/post/new', add)
    .get('/post/:id', show)
    .post('/post', create)
    .post('/VN/2.0/oauth/access_token', access_token)
    .post('/VN/4.1/orders', create_order)
    .get('/VN/2.0/reports/waybill', generateWaybill)
    .delete('/VN/2.2/orders', cancelOrder);



/**
 * Post listing.
 */

async function list(ctx) {

    await ctx.render('list', {posts: posts});
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
    await ctx.render('show', {post: post});
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
    const access_token = crypto.randomBytes(20).toString('hex');
    const posts =
        {
            "access_token": access_token,
            "expires": 1,
            "expires_in": 300,
            "token_type": "bearer"
        };

    ctx.response.status = 200;
    ctx.response.body = posts;
}


async function create_order(ctx) {

    console.log('GET create_order');
    const bodyData = ctx.request.body;
    console.log(bodyData);

    bodyData.tracking_number = Math.floor(
        Math.random() * (1000000000 - 10000000) + 10000000
    );
    bodyData.requested_tracking_number = bodyData.tracking_number.toString();
    bodyData.tracking_number = 'PREFIX-' +  bodyData.tracking_number.toString();
    const posts = bodyData;

    ctx.response.status = 200;
    ctx.response.body = posts;
}

async function generateWaybill(ctx) {
    console.log('generateWaybill');
    const parameters = ctx.request.query;
    console.log(parameters);


    const PassThrough = require('stream').PassThrough;
    const request = require('request');

    const url = 'https://collegereadiness.collegeboard.org/pdf/sat-practice-test-8.pdf';
    ctx.set('Content-Type', 'application/pdf');
    ctx.body = request(url).pipe(PassThrough());
}

async function cancelOrder(ctx) {
    console.log('cancelOrder');
    const parameters = ctx.request.query;
    console.log(parameters);

    const post = {
        "trackingId": "",
        "status": "",
        "updatedAt": new Date()
    };
    ctx.response.status = 200;
    ctx.response.body = post;
}

app.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
});

AwakeHeroku.add("https://ninjavanserver.herokuapp.com");
AwakeHeroku.start();