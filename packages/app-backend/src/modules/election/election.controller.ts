import { Controller, Post, Body, Sse, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { ElectionService, SseMessageEvent } from './election.service.js';
import { RunElectionScanDto } from './dto/election.dto.js';

@ApiTags('Election (Ngày Tốt & Async Scans)')
@Controller('v1/election')
export class ElectionController {
  constructor(@Inject(ElectionService) private readonly electionService: ElectionService) {}

  @Post('scan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run synchronous auspicious date range calculation scan' })
  @ApiResponse({ status: 200, description: 'Election scan calculation envelope and results' })
  runScan(@Body() body: RunElectionScanDto) {
    return this.electionService.runScan(body);
  }

  @Post('scan/stream')
  @Sse()
  @ApiOperation({ summary: 'Run chunked election scan with real-time Server-Sent Events (SSE)' })
  @ApiResponse({ status: 200, description: 'Stream of omce:progress, omce:chunk, and omce:result events' })
  streamScan(@Body() body: RunElectionScanDto): Observable<SseMessageEvent> {
    return this.electionService.streamScan(body);
  }
}
