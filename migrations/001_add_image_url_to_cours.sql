-- Migration to add image_url column to cours table
ALTER TABLE cours ADD COLUMN image_url VARCHAR(500) AFTER youtube_vd_url;