#!/bin/bash

echo "📊 AI Report Reliability Dashboard"
echo "=================================="
echo ""

# Check current configuration
./check-ai-config.sh > /dev/null 2>&1
config_status=$?

if [ $config_status -eq 0 ]; then
    echo "✅ OpenAI Configuration: HEALTHY"
else
    echo "🔴 OpenAI Configuration: CRITICAL ISSUES DETECTED"
    echo "   Run ./check-ai-config.sh for details"
fi

echo ""

# Test report generation
echo "🧪 Testing Report Generation..."
echo "Generating sample enhanced AI report..."

start_time=$(date +%s)
./test-enhanced-ai-pdf.sh > /dev/null 2>&1
test_status=$?
end_time=$(date +%s)
duration=$((end_time - start_time))

if [ $test_status -eq 0 ]; then
    # Check if we got the enhanced AI report (should be >500KB)
    if [ -f "test-enhanced-ai-report.pdf" ]; then
        file_size=$(stat -f%z "test-enhanced-ai-report.pdf" 2>/dev/null || stat -c%s "test-enhanced-ai-report.pdf" 2>/dev/null)
        file_size_kb=$((file_size / 1024))
        
        if [ $file_size_kb -gt 500 ]; then
            echo "✅ Enhanced AI Report: SUCCESS (${file_size_kb}KB in ${duration}s)"
            echo "   Clients will receive full AI-powered analysis"
        else
            echo "⚠️  Enhanced AI Report: DEGRADED (${file_size_kb}KB in ${duration}s)"
            echo "   Report generated but smaller than expected"
        fi
    else
        echo "🔴 Enhanced AI Report: FAILED"
        echo "   Clients may receive fallback reports"
    fi
else
    echo "🔴 Report Generation: FAILED"
    echo "   Clients will receive fallback reports"
fi

echo ""
echo "📈 Recommendations:"
echo "1. Run this check before client sessions"
echo "2. Monitor OpenAI billing and quota limits"
echo "3. Set up alerts for fallback report usage"
echo "4. Keep backup service account keys ready"
echo ""

if [ $config_status -eq 0 ] && [ $test_status -eq 0 ] && [ $file_size_kb -gt 500 ]; then
    echo "🚀 Status: READY FOR PRODUCTION"
    exit 0
else
    echo "⚠️  Status: ISSUES DETECTED - May impact client experience"
    exit 1
fi
