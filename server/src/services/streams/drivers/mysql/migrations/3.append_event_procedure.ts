import Knex from "knex";

export const up = async (knex: Knex) => {
    await knex.raw(`
		CREATE PROCEDURE append_event (
			IN v_topic VARCHAR(255),
			INOUT v_seq INT,
			IN v_published_at VARCHAR(30),
			IN v_key varchar(255),
			in v_data text
		) 
		BEGIN
			DECLARE next_seq INT;
			
			SELECT (seq+1) as next_seq INTO next_seq FROM mercurios_topics 
				WHERE topic = v_topic FOR UPDATE;
			
			IF (next_seq IS NULL) THEN
				SIGNAL SQLSTATE '45000' 
					SET MESSAGE_TEXT = 'ERR_NO_STREAM';
					
			ELSEIF (v_seq IS NOT NULL AND v_seq != next_seq) THEN
				SIGNAL SQLSTATE '45000' 
					SET MESSAGE_TEXT = 'ERR_CONFLICT';
					
			ELSE
				SET v_seq = next_seq;
				
				UPDATE mercurios_topics SET seq = v_seq 
				WHERE topic = v_topic;
				
				INSERT INTO mercurios_events (topic, seq, published_at, \`key\`, \`data\`)
					VALUES (v_topic, v_seq, v_published_at, v_key, v_data);
			END IF;
		END
    `);
};

export const down = async () => {};
