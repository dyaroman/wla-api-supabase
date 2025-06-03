export const getCombined = async (c) => {
    const { env } = c.req.query();

    try {
        // get data from info table
        const infoData = await c.env.DB.prepare(
            'SELECT * FROM info WHERE env = (?)',
        )
            .bind(env)
            .first();
        const { commit, timestamp } = infoData ?? {};

        // get data from columns table
        const columnsData = await c.env.DB.prepare(
            'SELECT * FROM columns WHERE env = (?)',
        )
            .bind(env)
            .first();
        const columns = JSON.parse(columnsData?.['columns'] ?? '{}');

        // get data from websites table
        const websitesData = await c.env.DB.prepare(
            'SELECT data FROM websites WHERE env = (?)',
        )
            .bind(env)
            .run();
        const websites = websitesData?.['results'].map((row) =>
            JSON.parse(row?.['data'] ?? '{}'),
        );

        console.log('websites', websites?.length, 'commit', commit);

        return c.json({
            commit,
            timestamp,
            columns,
            websites,
        });
    } catch (e) {
        console.log('failed to fetch full data', e.message);
        return c.json(
            {
                error: 'failed to fetch full data',
                message: e.message,
            },
            500,
        );
    }
};
