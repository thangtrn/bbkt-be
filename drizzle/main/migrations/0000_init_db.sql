CREATE TABLE "bs_customer_type" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_type_code" varchar(100) NOT NULL,
	"customer_type_name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bs_customer_type_customer_type_code_unique" UNIQUE("customer_type_code")
);
--> statement-breakpoint
CREATE TABLE "bs_customer" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_code" varchar(100) NOT NULL,
	"customer_name" varchar NOT NULL,
	"customer_type_code" varchar(100),
	"company_name" varchar,
	"customer_type" varchar(50) NOT NULL,
	"address" varchar,
	"tax_code" varchar(50) NOT NULL,
	"email" text[] DEFAULT '{}' NOT NULL,
	"phone" text[] DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bs_customer_customer_code_unique" UNIQUE("customer_code")
);
