CREATE INDEX "alerts_family_dismissed_idx" ON "alerts" USING btree ("family_id","dismissed");--> statement-breakpoint
CREATE INDEX "alerts_child_id_idx" ON "alerts" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "browsing_history_family_visited_idx" ON "browsing_history" USING btree ("family_id","visited_at");--> statement-breakpoint
CREATE INDEX "browsing_history_child_id_idx" ON "browsing_history" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "children_family_id_idx" ON "children" USING btree ("family_id");--> statement-breakpoint
CREATE UNIQUE INDEX "children_pairing_code_idx" ON "children" USING btree ("pairing_code");--> statement-breakpoint
CREATE UNIQUE INDEX "children_device_token_idx" ON "children" USING btree ("device_token");--> statement-breakpoint
CREATE INDEX "dns_logs_child_visited_idx" ON "dns_logs" USING btree ("child_id","visited_at");--> statement-breakpoint
CREATE UNIQUE INDEX "families_parent_user_id_idx" ON "families" USING btree ("parent_user_id");--> statement-breakpoint
CREATE INDEX "geofences_family_id_idx" ON "geofences" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "gps_events_child_recorded_idx" ON "gps_events" USING btree ("child_id","recorded_at");