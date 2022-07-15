-- View: public.county_names

-- DROP VIEW public.county_names;

CREATE OR REPLACE VIEW public.county_names
 AS
 WITH foo AS (
         SELECT b.county,
            count(*) AS count
           FROM data a,
            jobs_details b
          WHERE a.job_id::text = b.job_id::text
          GROUP BY b.county
        )
 SELECT counties.id,
    counties."NAME",
    counties.geometry,
    COALESCE(foo.count, 0::bigint) AS count
   FROM counties
     LEFT JOIN foo ON counties."NAME"::text = foo.county::text
  ORDER BY (COALESCE(foo.count, 0::bigint));



-- View: public.county_count

-- DROP VIEW public.county_count;

CREATE OR REPLACE VIEW public.county_count
 AS
 WITH foo AS (
         SELECT counties_1.id,
            count(*) AS count
           FROM counties counties_1,
            data
          WHERE st_intersects(counties_1.geometry, data.geometry)
          GROUP BY counties_1.id
        )
 SELECT counties.id,
    counties."NAME",
    counties.geometry,
    foo.count
   FROM counties
     LEFT JOIN foo ON counties.id = foo.id;

ALTER TABLE public.county_count
    OWNER TO postgres;



CREATE OR REPLACE FUNCTION public.tbl_counties(
	z integer,
	x integer,
	y integer)
    RETURNS bytea
    LANGUAGE 'sql'
    COST 100
    STABLE PARALLEL SAFE
AS $BODY$
	WITH
bounds AS (
    SELECT ST_TileEnvelope(z, x, y) AS geom,
           ST_TileEnvelope(z, x, y)::box2d AS b2d
),
mvtgeom AS (
    SELECT ST_AsMVTGeom(ST_Transform(t.geometry, 3857), bounds.b2d) AS geom,
           "NAME", t.count
    FROM public.county_names t, bounds
    WHERE ST_Intersects(ST_Transform(t.geometry, 3857), ST_Transform(bounds.geom, 3857))

)
SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom;

$BODY$;



CREATE OR REPLACE FUNCTION public.tbl_grid(
	z integer,
	x integer,
	y integer)
    RETURNS bytea
    LANGUAGE 'sql'
    COST 100
    STABLE PARALLEL SAFE
AS $BODY$
	WITH
bounds AS (
    SELECT ST_TileEnvelope(z, x, y) AS geom,
           ST_TileEnvelope(z, x, y)::box2d AS b2d
),
mvtgeom AS (
    SELECT ST_AsMVTGeom(ST_Transform(t.geometry, 3857), bounds.b2d) AS geom,
           col1,col2,col3
    FROM public.data t, bounds
    WHERE ST_Intersects(ST_Transform(t.geometry,3857),ST_Transform(bounds.geom,3857))
)
SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom;

$BODY$;


-- Table: public.states

-- DROP TABLE IF EXISTS public.states;

CREATE TABLE IF NOT EXISTS public.states
(
    id integer NOT NULL,
    "NAME" character varying COLLATE pg_catalog."default",
    geometry geometry(Geometry,4326) NOT NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.states
    OWNER to postgres;
-- Index: idx_states_geometry

-- DROP INDEX IF EXISTS public.idx_states_geometry;

CREATE INDEX IF NOT EXISTS idx_states_geometry
    ON public.states USING gist
    (geometry)
    TABLESPACE pg_default;
-- Index: ix_states_id

-- DROP INDEX IF EXISTS public.ix_states_id;

CREATE INDEX IF NOT EXISTS ix_states_id
    ON public.states USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;

