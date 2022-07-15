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

ALTER TABLE public.county_names
    OWNER TO postgres;



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

