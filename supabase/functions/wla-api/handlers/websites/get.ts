export const getWebsites = async (c) => {
    const { env } = c.req.query();

    try {
        const websites = await c.env.DB.prepare(
            'SELECT website FROM websites WHERE env = (?)',
        )
            .bind(env)
            .run();

        console.log('websites', websites?.results?.length);
        return c.json(websites['results'].map((row) => row['website']));
    } catch (e) {
        console.log('failed to fetch websites list', e.message);
        return c.json(
            {
                error: 'failed to fetch websites list',
                message: e.message,
            },
            500,
        );
    }
};
