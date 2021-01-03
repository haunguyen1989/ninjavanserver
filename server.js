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

        bodyData.tracking_number = Math.floor(
            Math.random() * (1000000000 - 10000000) + 10000000
        );

        const posts = bodyData;
        ctx.response.status = 200;
        ctx.response.body = posts;
    }

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});
