package com.pmo.demo.domain;

import java.util.ArrayList;
import java.util.List;

public class BrMatchResult {

    private String autoReqId;
	private String clientName;
	private String grade;
	private String skills;
	private List<CandidateMatch> candidates = new ArrayList<>();

    public BrMatchResult(String autoReqId) {
        this.autoReqId = autoReqId;
    }

    public String getAutoReqId() {
        return autoReqId;
    }

    public String getClientName() {
		return clientName;
	}

	public void setClientName(String clientName) {
		this.clientName = clientName;
	}
	
	public String getGrade() {
		return grade;
	}

	public void setGrade(String grade) {
		this.grade = grade;
	}

	public String getSkills() {
		return skills;
	}

	public void setSkills(String skills) {
		this.skills = skills;
	}

    public List<CandidateMatch> getCandidates() {
        return candidates;
    }
    
    public void addCandidate(CandidateMatch candidate) {
        this.candidates.add(candidate);
    }

}
