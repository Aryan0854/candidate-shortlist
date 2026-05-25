package com.pmo.demo.serviceImpl;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pmo.demo.domain.BrMatchResult;
import com.pmo.demo.domain.CandidateMatch;
import com.pmo.demo.entity.BrDataEntity;
import com.pmo.demo.proxy.SkillsMatchProxy;
import com.pmo.demo.repository.BrDataRepository;
import com.pmo.demo.service.SkillMatchReportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SkillMatchReportServiceImpl implements SkillMatchReportService {

	private final BrDataRepository brDataRepository;

	@Autowired
	private SkillsMatchProxy skillsMatchProxy;

	@Override
	public byte[] generateSkillMatchReport() {

		List<BrDataEntity> brList = brDataRepository.findAll();
		List<BrMatchResult> brMatchResults = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
		List<String> data = new ArrayList<>();
//		data.add("{\"autoReqid\":\"1BR\",\"clientName\":\"\",\"grade\":\"E2\",\"skills\":\"AWS (Bedrock, EKS/OpenShift, Lambda, S3, Kafka/MSK, DynamoDB, RDS, Terraform, security & networking\",\"results\":[{\"empNo\":\"A22+1\",\"employeeName\":\"Udit Raghav\",\"grade\":\"E3\",\"top3Skills\":\"AWS, Kubernetes, Terraform\",\"skillBucket\":\"AWS Cloud Architecture, Kubernetes Platform Engineering (EKS), Infrastructure as Code using Terraform & Terragrunt, CI/CD Pipeline Engineering (GitLab), Docker Containerization, Helm Chart Deployments, Cloud Observability & Monitoring, DevSecOps & Security Hardening, Cloud Cost Optimization & Autoscaling\",\"detailedSkills\":\"Overall 3.6+ years of experience in AWS cloud platforms, Kubernetes (EKS), Terraform-based infrastructure automation, CI/CD pipelines, Docker & Helm deployments, cloud observability using CloudWatch, Prometheus & Grafana, DevSecOps practices, and cloud cost optimization\",\"match%\":44.07,\"skillMatch%\":{\"AWS (Bedrock\":43.62,\"EKS/OpenShift\":41.23,\"Lambda\":15.22,\"S3\":21.56,\"Kafka/MSK\":18.76,\"DynamoDB\":26.04,\"RDS\":11.43,\"Terraform\":50.98,\"security & networking\":19.08}},{\"empNo\":\"A7+1\",\"employeeName\":\"Nidhi Kumari S\",\"grade\":\"E3\",\"top3Skills\":\"AWS, Terraform, Jenkins\",\"skillBucket\":\"AWS Infrastructure Management, CI/CD Pipeline Implementation, Terraform-Based Provisioning, Docker Containerization, Kubernetes (EKS), Configuration Management (Ansible), Cloud Monitoring, DevOps Automation\",\"detailedSkills\":\"Overall 3+ years of experience in AWS cloud infrastructure, Terraform provisioning, CI/CD pipelines, Docker, Kubernetes, monitoring, and DevOps automation\",\"match%\":42.73,\"skillMatch%\":{\"AWS (Bedrock\":41.77,\"EKS/OpenShift\":34.98,\"Lambda\":12.92,\"S3\":30.05,\"Kafka/MSK\":16.97,\"DynamoDB\":21.3,\"RDS\":12.59,\"Terraform\":49.29,\"security & networking\":20.5}},{\"empNo\":\"A3+1\",\"employeeName\":\"Aditya Lodh\",\"grade\":\"E3\",\"top3Skills\":\"AWS, DevOps, Kubernetes\",\"skillBucket\":\"AWS Cloud Architecture, Infrastructure as Code (Terraform), CI/CD Pipeline Engineering, Kubernetes & Container Orchestration, Docker-Based Deployments, Linux System Administration, Monitoring & Observability, Incident Management, Disaster Recovery, Network & VPC Configuration\",\"detailedSkills\":\"Overall 6+ years of experience in AWS cloud engineering, DevOps automation, Terraform-based infrastructure, Kubernetes orchestration, CI/CD pipelines, monitoring, and incident management\",\"match%\":40.7,\"skillMatch%\":{\"AWS (Bedrock\":46.91,\"EKS/OpenShift\":36.07,\"Lambda\":18.09,\"S3\":32.3,\"Kafka/MSK\":17.92,\"DynamoDB\":25.21,\"RDS\":14.27,\"Terraform\":46.48,\"security & networking\":24.41}},{\"empNo\":\"A21+1\",\"employeeName\":\"Md Tarique Bilal\",\"grade\":\"E3\",\"top3Skills\":\"DevOps, Terraform, Kubernetes\",\"skillBucket\":\"DevOps Automation & CI/CD Engineering, Infrastructure as Code (Terraform & CloudFormation), Multi-Cloud Deployments (AWS, Azure, GCP), Kubernetes & Container Orchestration, Docker Image Optimization, Monitoring & Alerting (Prometheus, Grafana, CloudWatch), DevSecOps & Security Automation, Cost Optimization & Compliance Automation\",\"detailedSkills\":\"Overall 2+ years of experience in DevOps engineering, Terraform & CloudFormation IaC, CI/CD pipelines, Kubernetes orchestration, Docker containerization, cloud monitoring & alerting, DevSecOps automation, and multi-cloud infrastructure management\",\"match%\":38.58,\"skillMatch%\":{\"AWS (Bedrock\":35.25,\"EKS/OpenShift\":27.81,\"Lambda\":14.91,\"S3\":18.41,\"Kafka/MSK\":18.65,\"DynamoDB\":16.04,\"RDS\":13.71,\"Terraform\":47.59,\"security & networking\":24.62}},{\"empNo\":\"A16+1\",\"employeeName\":\"Shubham Sanjay Raka\",\"grade\":\"E3\",\"top3Skills\":\"Python, Backend APIs, AWS\",\"skillBucket\":\"Python Backend Development, REST API Design, Serverless Architecture (AWS Lambda & API Gateway), Cloud-Native Microservices, Data Platforms & Integration, CI/CD Automation, AI/ML Feature Integration, System Design & Code Quality\",\"detailedSkills\":\"Overall 5+ years of experience in Python backend development, REST APIs, AWS serverless architecture, CI/CD pipelines, enterprise data platforms, and AI-enabled application development\",\"match%\":28.98,\"skillMatch%\":{\"AWS (Bedrock\":40.48,\"EKS/OpenShift\":26.74,\"Lambda\":27.67,\"S3\":29.48,\"Kafka/MSK\":13.85,\"DynamoDB\":29.96,\"RDS\":17.5,\"Terraform\":26.37,\"security & networking\":25.05}}]}\r\n"
//				+ "");
//		data.add("{\"autoReqid\":\"2BR\",\"clientName\":\"\",\"grade\":\"E2\",\"skills\":\"Java, Spring Boot, microservices, REST APIs, event-driven architectures, batch processing\",\"results\":[{\"empNo\":\"A17+1\",\"employeeName\":\"Shubhangi Shivaji Bari\",\"grade\":\"E3\",\"top3Skills\":\"Java, Spring Boot, REST APIs\",\"skillBucket\":\"Java Backend Development, Spring Boot Microservices, REST API Engineering, JPA & Hibernate ORM, BFSI Domain Systems, Database Migration (MySQL to Oracle), CI/CD Automation, AWS Cloud Services, Production Support & Incident Resolution\",\"detailedSkills\":\"Overall 4+ years of experience in Java, Spring Boot, REST APIs, microservices, BFSI systems, database migration, CI/CD pipelines, AWS cloud services, and production support\",\"match%\":100.0,\"skillMatch%\":{\"Java\":40.27,\"Spring Boot\":37.76,\"microservices\":41.3,\"REST APIs\":38.1,\"event-driven architectures\":19.13,\"batch processing\":18.13}},{\"empNo\":\"1\",\"employeeName\":\"Prajakta Shiradkar\",\"grade\":\"E3\",\"top3Skills\":\"Java, Spring Boot, Microservices\",\"skillBucket\":\"Java Backend Development, Spring Boot Application Development, REST API Design & Development, Microservices Architecture, Database Design & Optimization, SQL & PostgreSQL, Apache Camel Integrations, Cloud Deployment (AWS & GCP), CI/CD Pipeline Management, Application Performance Optimization, Production Support\",\"detailedSkills\":\"Overall 4.8+ years of experience in Java Backend Development, Spring Boot, REST APIs, Microservices, Database Optimization, Apache Camel integrations, AWS & GCP deployments, CI/CD pipelines, and production support\",\"match%\":100.0,\"skillMatch%\":{\"Java\":45.81,\"Spring Boot\":38.44,\"microservices\":41.96,\"REST APIs\":36.53,\"event-driven architectures\":16.58,\"batch processing\":20.98}},{\"empNo\":\"A14+1\",\"employeeName\":\"Saurabh Chikankar\",\"grade\":\"E3\",\"top3Skills\":\"Java, Spring Boot, REST APIs\",\"skillBucket\":\"Java Backend Development, Spring Boot REST API Engineering, Microservices Architecture, SQL & PostgreSQL Databases, Redis Caching, Kafka Messaging, Batch Job Processing, Performance Optimization, Production Support, Secure & Scalable Code Design\",\"detailedSkills\":\"Overall 4+ years of experience in Java, Spring Boot, REST APIs, Microservices, Redis, Kafka, SQL databases, backend performance optimization, and enterprise production support\",\"match%\":100.0,\"skillMatch%\":{\"Java\":44.21,\"Spring Boot\":40.09,\"microservices\":40.84,\"REST APIs\":41.52,\"event-driven architectures\":21.97,\"batch processing\":23.44}},{\"empNo\":\"A13+1\",\"employeeName\":\"Rituraj Azad\",\"grade\":\"E3\",\"top3Skills\":\"Java, Spring Boot, Microservices\",\"skillBucket\":\"Java Backend Engineering, Spring Boot Microservices, Event-Driven Architecture, REST API Design, Kafka Messaging, Redis Caching, Cloud-Native Development (AWS & Azure), Docker & Kubernetes, CI/CD Automation, Secure API Design & Resilience Patterns\",\"detailedSkills\":\"Overall 8+ years of experience in Java, Spring Boot, Microservices, Kafka, Redis, REST APIs, AWS & Azure cloud platforms, CI/CD automation, and enterprise backend systems\",\"match%\":100.0,\"skillMatch%\":{\"Java\":38.13,\"Spring Boot\":35.95,\"microservices\":52.48,\"REST APIs\":37.28,\"event-driven architectures\":30.17,\"batch processing\":14.23}},{\"empNo\":\"A11+1\",\"employeeName\":\"Rayachoti Lalithya\",\"grade\":\"E3\",\"top3Skills\":\"Java, Spring Boot, Microservices\",\"skillBucket\":\"Java Backend Development, Spring Boot Application Development, Microservices Architecture, REST API Development, JPA & Hibernate ORM, Database Design & Optimization, Spring Security & JWT Authentication, CI/CD using Jenkins & Ansible, Production Support & Bug Fixing, Agile Development\",\"detailedSkills\":\"Overall 5+ years of experience in Java, Spring Boot, Microservices, REST APIs, JPA/Hibernate, SQL & NoSQL databases, Spring Security, CI/CD pipelines, AWS deployments, and production support\",\"match%\":99.67,\"skillMatch%\":{\"Java\":43.02,\"Spring Boot\":43.93,\"microservices\":41.22,\"REST APIs\":33.02,\"event-driven architectures\":17.89,\"batch processing\":13.83}}]}");
//		data.add("{\"autoReqid\":\"3BR\",\"clientName\":\"\",\"grade\":\"E1\",\"skills\":\"Angular, TypeScript, modern web UI frameworks\",\"results\":[{\"empNo\":\"A23+1\",\"employeeName\":\"Varun Kumar\",\"grade\":\"E2\",\"top3Skills\":\"Angular, TypeScript, Frontend Development\",\"skillBucket\":\"Angular SPA Development, TypeScript & JavaScript Programming, Responsive UI Development, REST API Integration, Secure Authentication Flows (JWT, OAuth, SSO), Fintech & Banking UI Development, Component-Based Architecture, UI Performance Optimization, Frontend Mentoring & Code Reviews\",\"detailedSkills\":\"Overall 4+ years of experience in Angular-based frontend development, TypeScript & JavaScript, responsive UI design, REST API consumption, secure authentication flows, fintech and banking domain applications, and frontend best practices\",\"match%\":100.0,\"skillMatch%\":{\"Angular\":55.87,\"TypeScript\":34.21,\"modern web UI frameworks\":45.64}},{\"empNo\":\"A15+1\",\"employeeName\":\"Shubham Dwivedi\",\"grade\":\"E3\",\"top3Skills\":\"Angular, TypeScript, Frontend Architecture\",\"skillBucket\":\"Angular SPA Development (2–18), TypeScript-Based Architecture, Responsive UI Design, Angular Material & UI Libraries, REST API Integration, Frontend Performance Optimization, CI/CD & Cloud Deployments, Mentoring & Code Reviews\",\"detailedSkills\":\"Overall 8+ years of experience in Angular, TypeScript, frontend architecture, responsive UI development, REST integrations, cloud deployments, and frontend performance optimization\",\"match%\":100.0,\"skillMatch%\":{\"Angular\":54.49,\"TypeScript\":36.14,\"modern web UI frameworks\":45.91}},{\"empNo\":\"A4+1\",\"employeeName\":\"Govinda Rao Kottisa\",\"grade\":\"E3\",\"top3Skills\":\"Angular, TypeScript, JavaScript\",\"skillBucket\":\"Angular SPA Development, TypeScript-Based Frontend Architecture, Responsive UI Development, Angular Material & UI Libraries, Reactive & Template-Driven Forms, REST API Integration, Frontend Performance Optimization, Unit & Integration Testing, UI Scalability & Maintainability\",\"detailedSkills\":\"Overall 7+ years of experience in Angular-based frontend development, TypeScript, JavaScript, responsive UI design, REST integrations, testing, and scalable SPA architecture\",\"match%\":100.0,\"skillMatch%\":{\"Angular\":58.66,\"TypeScript\":38.84,\"modern web UI frameworks\":50.77}},{\"empNo\":\"A19+1\",\"employeeName\":\"Smriti Dave\",\"grade\":\"E2\",\"top3Skills\":\"Angular, JavaScript, UI Development\",\"skillBucket\":\"Angular SPA Development, Responsive UI Design, TypeScript & JavaScript Programming, REST API Integration, Angular Material & Bootstrap, UI/UX Optimization, Frontend Performance Tuning, Team Collaboration\",\"detailedSkills\":\"Overall 4+ years of experience in Angular, JavaScript, responsive UI development, REST API integration, frontend optimization, and enterprise web applications\",\"match%\":81.72,\"skillMatch%\":{\"Angular\":57.16,\"TypeScript\":28.42,\"modern web UI frameworks\":45.53}},{\"empNo\":\"A9+1\",\"employeeName\":\"Rajani Akarapu\",\"grade\":\"E4\",\"top3Skills\":\"Angular, React, Node.js\",\"skillBucket\":\"Angular & React Frontend Development, JavaScript & TypeScript Programming, Node.js Backend APIs, RESTful Services, UI Performance Optimization, Agile Development, Client-Facing Enterprise Applications\",\"detailedSkills\":\"Overall 9+ years of experience in Angular, React, Node.js, JavaScript, TypeScript, enterprise UI development, REST APIs, and agile delivery\",\"match%\":76.18,\"skillMatch%\":{\"Angular\":49.86,\"TypeScript\":37.77,\"modern web UI frameworks\":39.34}}]}\r\n"
//				+ "");
		
		for (BrDataEntity br : brList) {
		// for (String response : data) {
			ResponseEntity<String> response = skillsMatchProxy.proxyMatchSkills(br.getAutoReqId());
			System.out.println("Response from Python service:");
			System.out.println(response.getBody());
			//System.out.println(response);

			JsonNode rootNode = null;
			try {
				rootNode = mapper.readTree(response.getBody());
				//rootNode = mapper.readTree(response);
			} catch (JsonMappingException e) {
				e.printStackTrace();
			} catch (JsonProcessingException e) {
				e.printStackTrace();
			}
		    //String autoReqId = rootNode.get("autoReqid").asText();
		    
		    JsonNode results = rootNode.get("results");
		    BrMatchResult brMatchResult = new BrMatchResult(rootNode.get("autoReqid").asText());
		    brMatchResult.setClientName(rootNode.get("clientName").asText());
		    brMatchResult.setSkills(rootNode.get("skills").asText());
		    
		    int count = 0;
		    Iterator<JsonNode> iterator = results.elements();

		    while (iterator.hasNext() && count < 5) {
		        JsonNode candidate = iterator.next();
		        String employeeName = candidate.get("employeeName").asText();
		        
		        JsonNode skillMatchNode = candidate.get("skillMatch%");
		        Map<String, String> skillMatch = new HashMap<>(); 
		        Iterator<String> fieldNames = skillMatchNode.fieldNames(); 
		        while (fieldNames.hasNext()) {
		        	String key = fieldNames.next(); 
		        	String value = skillMatchNode.get(key).asText(); 
		        	// convert to String 
		        	skillMatch.put(key, value); 
		        }
		        System.out.println("skillMatch :: " + skillMatch);
		        brMatchResult.addCandidate(new CandidateMatch(employeeName, skillMatch));
		        count++;
		    }
		    brMatchResults.add(brMatchResult);
		}
		System.out.println("brMatchResults :: " + brMatchResults.size());
		
		byte[] outputBytes = null;
		try {
			outputBytes = writeExcelToOutputStream(brMatchResults);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return outputBytes;
	}
	
    public byte[] writeExcelToOutputStream(List<BrMatchResult> brMatchResults) throws Exception {

    	ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("BR Skill Match");
        
        Font boldFont = workbook.createFont();
		boldFont.setBold(true);

		CellStyle headerStyle = workbook.createCellStyle();
		headerStyle.setFont(boldFont);
		headerStyle.setAlignment(HorizontalAlignment.CENTER);
		headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

		CellStyle centerStyle = workbook.createCellStyle();
		centerStyle.setAlignment(HorizontalAlignment.CENTER);
		centerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        
		int rowNum = 0;

		// Header
		Row header1 = sheet.createRow(rowNum++);
		header1.createCell(0).setCellValue("AutoReqId");
		header1.createCell(1).setCellValue("ClientName");
		header1.createCell(2).setCellValue("Required Skills");

		header1.getCell(0).setCellStyle(headerStyle);
		header1.getCell(1).setCellStyle(headerStyle);
		header1.getCell(2).setCellStyle(headerStyle);

		int colIndex = 3;
		int firstResults = brMatchResults.get(0).getCandidates().size();

		for (int i = 0; i < firstResults; i++) {

			Cell cell = header1.createCell(colIndex);
			cell.setCellValue("Candidate-" + (i + 1));
			cell.setCellStyle(headerStyle);

			sheet.addMergedRegion(new CellRangeAddress(0, 0, colIndex, colIndex + 2));
			colIndex += 3;
		}

		Row header2 = sheet.createRow(rowNum++);
		sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 2));
		header2.createCell(0).setCellStyle(headerStyle);
		colIndex = 3;
		
		for (int i = 0; i < firstResults; i++) {

			Cell sub1 = header2.createCell(colIndex++);
			sub1.setCellValue("CandidateName");
			sub1.setCellStyle(headerStyle);

			Cell sub2 = header2.createCell(colIndex++);
			sub2.setCellValue("Technology");
			sub2.setCellStyle(headerStyle);

			Cell sub3 = header2.createCell(colIndex++);
			sub3.setCellValue("Skill%");
			sub3.setCellStyle(headerStyle);
		}

		for (BrMatchResult brMatch : brMatchResults) {

			List<CandidateMatch> results = brMatch.getCandidates();
			
			int maxSkills = 0;
			for (CandidateMatch r : results) {
				maxSkills = Math.max(maxSkills, r.getSkillMatch().size());
			}

			int startDataRow = rowNum;

			for (int i = 0; i < maxSkills; i++) {
				sheet.createRow(rowNum++);
			}

			int endDataRow = rowNum - 1;

			sheet.addMergedRegion(new CellRangeAddress(startDataRow, endDataRow, 0, 0));
			sheet.addMergedRegion(new CellRangeAddress(startDataRow, endDataRow, 1, 1));

			int middleRowIndex = startDataRow + (maxSkills / 2);
			Row middleRow = sheet.getRow(middleRowIndex);

			Cell autoReqCell = middleRow.createCell(0);
			autoReqCell.setCellValue(brMatch.getAutoReqId());
			autoReqCell.setCellStyle(centerStyle);

			Cell clientCell = middleRow.createCell(1);
			clientCell.setCellValue(brMatch.getClientName());
			clientCell.setCellStyle(centerStyle);

			String[] skillsArray = brMatch.getSkills().split(",");

			for (int i = 0; i < skillsArray.length; i++) {
				Row row = sheet.getRow(startDataRow + i);
				if (row == null) {
					row = sheet.createRow(startDataRow + i);
				}
				Cell skillCell = row.createCell(2);
				skillCell.setCellValue(skillsArray[i].trim());
				skillCell.setCellStyle(centerStyle);
			}
			colIndex = 3;

			for (CandidateMatch result : results) {

				sheet.addMergedRegion(new CellRangeAddress(startDataRow, endDataRow, colIndex, colIndex));

				Row nameRow = sheet.getRow(middleRowIndex);
				Cell nameCell = nameRow.createCell(colIndex);
				nameCell.setCellValue(result.getEmployeeName());
				nameCell.setCellStyle(centerStyle);

				List<Map.Entry<String, String>> skillList = new ArrayList<>(result.getSkillMatch().entrySet());

				for (int i = 0; i < skillList.size(); i++) {

					Row row = sheet.getRow(startDataRow + i);
					Map.Entry<String, String> entry = skillList.get(i);

					row.createCell(colIndex + 1).setCellValue(entry.getKey());
					row.createCell(colIndex + 2).setCellValue(entry.getValue());
				}
				colIndex += 3;
			}
			rowNum++;
		}

		for (int i = 0; i < 50; i++) {
			sheet.autoSizeColumn(i);
		}
		
		workbook.write(baos);
		workbook.close();
		System.out.println("Excel files generated.");
		return baos.toByteArray();
    }
}