# Supabase bios verification

After running `sql/bicephale_bios_seed.sql` in Supabase SQL Editor, run:

- `sql/bicephale_bios_verify.sql`

Expected results:

1. First query returns one row where:
   - `mismatch_count = 0`
   - `missing_count = 0`
   - `extra_count = 0`
   - `expected_total = actual_total = 18`
2. Second query (detailed diff) returns **0 rows**.

If any mismatches are returned, re-run `sql/bicephale_bios_seed.sql` and run verify again.
