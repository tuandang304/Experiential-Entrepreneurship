package com.aima.service;

import java.util.UUID;


public interface ContentGenerationWorkerService {

    void process(UUID jobId);
}
