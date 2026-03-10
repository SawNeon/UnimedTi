package com.unimedvargina.UnimedVarginhaTi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.unimedvargina.UnimedVarginhaTi")
public class UnimedVarginhaTiApplication {

	public static void main(String[] args) {
		SpringApplication.run(UnimedVarginhaTiApplication.class, args);
	}

}
