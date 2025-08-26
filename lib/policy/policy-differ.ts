/**
 * Policy Diff Engine
 * Compare policies and generate redline changes
 * @version 1.0.0
 */

import { PolicyDiff, RedlineChange, GeneratedPolicy } from './types'

export interface DiffOptions {
  ignoreWhitespace?: boolean
  ignoreCase?: boolean
  contextLines?: number
  granularity?: 'word' | 'sentence' | 'paragraph'
}

export class PolicyDiffer {
  /**
   * Compare two policies and generate diff
   */
  diffPolicies(
    basePolicy: GeneratedPolicy | string,
    newPolicy: GeneratedPolicy | string,
    options: DiffOptions = {}
  ): PolicyDiff[] {
    const baseText = typeof basePolicy === 'string' ? basePolicy : basePolicy.document.content
    const newText = typeof newPolicy === 'string' ? newPolicy : newPolicy.document.content

    console.log('Diffing policies with options:', options)

    const diffs: PolicyDiff[] = []
    
    // Split texts based on granularity
    const baseSegments = this.segmentText(baseText, options.granularity || 'sentence')
    const newSegments = this.segmentText(newText, options.granularity || 'sentence')

    // Perform LCS-based diff
    const lcsMatrix = this.computeLCS(baseSegments, newSegments, options)
    const changes = this.extractChanges(baseSegments, newSegments, lcsMatrix)

    // Convert to PolicyDiff format
    let position = 0
    for (const change of changes) {
      if (change.type === 'equal') {
        position += change.segments.length
        continue
      }

      const diff: PolicyDiff = {
        id: `diff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: change.type === 'insert' ? 'addition' : 
              change.type === 'delete' ? 'deletion' : 'modification',
        oldText: change.type === 'delete' ? change.segments.join(' ') : undefined,
        newText: change.type === 'insert' ? change.segments.join(' ') : undefined,
        position,
        description: this.generateChangeDescription(change)
      }

      diffs.push(diff)
      position += change.segments.length
    }

    return diffs
  }

  /**
   * Generate redline changes for document tracking
   */
  generateRedlineChanges(
    baseText: string,
    newText: string,
    author: string = 'Policy Engine',
    options: DiffOptions = {}
  ): RedlineChange[] {
    const changes: RedlineChange[] = []
    
    // Split into words for fine-grained tracking
    const baseWords = this.tokenizeText(baseText)
    const newWords = this.tokenizeText(newText)

    // Simple word-level diff
    const diff = this.simpleWordDiff(baseWords, newWords)

    let paragraphIndex = 0
    let sentenceIndex = 0
    let wordIndex = 0

    for (const change of diff) {
      if (change.type === 'equal') {
        // Track position
        for (const word of change.words) {
          if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
            sentenceIndex++
            wordIndex = 0
          } else if (word === '\n\n') {
            paragraphIndex++
            sentenceIndex = 0
            wordIndex = 0
          } else {
            wordIndex++
          }
        }
        continue
      }

      const redlineChange: RedlineChange = {
        id: `redline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: change.type === 'insert' ? 'insert' : 'delete',
        text: change.words.join(' '),
        position: {
          paragraph: paragraphIndex,
          sentence: sentenceIndex,
          word: wordIndex
        },
        author,
        timestamp: new Date().toISOString(),
        comment: this.generateChangeComment(change)
      }

      changes.push(redlineChange)

      // Update position for insertions
      if (change.type === 'insert') {
        wordIndex += change.words.length
      }
    }

    return changes
  }

  /**
   * Apply redline changes to create tracked document
   */
  applyRedlineChanges(
    baseText: string,
    changes: RedlineChange[]
  ): string {
    let result = baseText
    const sortedChanges = [...changes].sort((a, b) => {
      // Sort by position (paragraph, sentence, word)
      const aPos = a.position
      const bPos = b.position
      
      if (aPos.paragraph !== bPos.paragraph) return aPos.paragraph - bPos.paragraph
      if (aPos.sentence !== bPos.sentence) return aPos.sentence - bPos.sentence
      return aPos.word - bPos.word
    })

    // Apply changes in reverse order to maintain positions
    for (let i = sortedChanges.length - 1; i >= 0; i--) {
      const change = sortedChanges[i]
      result = this.applyRedlineChange(result, change)
    }

    return result
  }

  /**
   * Generate HTML with tracked changes visualization
   */
  renderRedlineHtml(
    baseText: string,
    changes: RedlineChange[],
    title: string = 'Policy Redlines'
  ): string {
    let html = baseText

    // Sort changes by position
    const sortedChanges = [...changes].sort((a, b) => {
      const aPos = a.position
      const bPos = b.position
      
      if (aPos.paragraph !== bPos.paragraph) return bPos.paragraph - aPos.paragraph
      if (aPos.sentence !== bPos.sentence) return bPos.sentence - aPos.sentence
      return bPos.word - aPos.word
    })

    // Apply HTML markup for changes
    for (const change of sortedChanges) {
      const position = this.findTextPosition(html, change.position)
      if (position >= 0) {
        if (change.type === 'insert') {
          const insertHtml = `<ins class="redline-insert" data-author="${change.author}" data-comment="${change.comment || ''}">${change.text}</ins>`
          html = html.substring(0, position) + insertHtml + html.substring(position)
        } else if (change.type === 'delete') {
          const deleteHtml = `<del class="redline-delete" data-author="${change.author}" data-comment="${change.comment || ''}">${change.text}</del>`
          html = html.substring(0, position) + deleteHtml + html.substring(position + change.text.length)
        }
      }
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 2in; color: #333; }
        h1 { text-align: center; margin-bottom: 1in; }
        .redline-insert { background-color: #e8f5e9; color: #2e7d32; text-decoration: none; }
        .redline-delete { background-color: #ffebee; color: #d32f2f; text-decoration: line-through; }
        .redline-insert:hover, .redline-delete:hover { 
            box-shadow: 0 0 4px rgba(0,0,0,0.3); 
            cursor: help; 
        }
        .redline-comment { 
            display: none; 
            position: absolute; 
            background: #fff; 
            border: 1px solid #ccc; 
            padding: 8px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.2); 
            z-index: 1000;
        }
        .metadata { 
            background: #f5f5f5; 
            padding: 20px; 
            margin-bottom: 30px; 
            border-left: 4px solid #2196f3; 
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Add tooltips for redline changes
            document.querySelectorAll('.redline-insert, .redline-delete').forEach(el => {
                el.addEventListener('mouseenter', function() {
                    const comment = this.getAttribute('data-comment')
                    const author = this.getAttribute('data-author')
                    if (comment) {
                        this.title = author + ': ' + comment
                    }
                })
            })
        })
    </script>
</head>
<body>
    <h1>${title}</h1>
    
    <div class="metadata">
        <strong>Redline Guide:</strong><br>
        <span class="redline-insert">Green text</span> = Additions<br>
        <span class="redline-delete">Red strikethrough</span> = Deletions<br>
        Hover over changes to see comments and author information.
    </div>
    
    ${html.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>')}
    
    <div style="margin-top: 3em; padding-top: 1em; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
        Generated by AI Readiness Policy Engine • ${new Date().toISOString()}
    </div>
</body>
</html>
    `
  }

  // Private helper methods

  private segmentText(text: string, granularity: 'word' | 'sentence' | 'paragraph'): string[] {
    switch (granularity) {
      case 'word':
        return text.split(/\s+/).filter(word => word.length > 0)
      case 'sentence':
        return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
      case 'paragraph':
        return text.split(/\n\s*\n/).filter(para => para.trim().length > 0)
      default:
        return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
    }
  }

  private tokenizeText(text: string): string[] {
    return text.split(/(\s+|\n\n)/).filter(token => token.length > 0)
  }

  private computeLCS(
    seq1: string[], 
    seq2: string[], 
    options: DiffOptions
  ): number[][] {
    const m = seq1.length
    const n = seq2.length
    const lcs = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const equal = options.ignoreCase ? 
          seq1[i - 1].toLowerCase() === seq2[j - 1].toLowerCase() :
          seq1[i - 1] === seq2[j - 1]

        if (equal) {
          lcs[i][j] = lcs[i - 1][j - 1] + 1
        } else {
          lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1])
        }
      }
    }

    return lcs
  }

  private extractChanges(
    seq1: string[], 
    seq2: string[], 
    lcs: number[][]
  ): Array<{ type: 'equal' | 'insert' | 'delete'; segments: string[] }> {
    const changes: Array<{ type: 'equal' | 'insert' | 'delete'; segments: string[] }> = []
    let i = seq1.length
    let j = seq2.length

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && seq1[i - 1] === seq2[j - 1]) {
        changes.unshift({ type: 'equal', segments: [seq1[i - 1]] })
        i--
        j--
      } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
        changes.unshift({ type: 'insert', segments: [seq2[j - 1]] })
        j--
      } else if (i > 0) {
        changes.unshift({ type: 'delete', segments: [seq1[i - 1]] })
        i--
      }
    }

    return this.consolidateChanges(changes)
  }

  private consolidateChanges(
    changes: Array<{ type: 'equal' | 'insert' | 'delete'; segments: string[] }>
  ): Array<{ type: 'equal' | 'insert' | 'delete'; segments: string[] }> {
    const consolidated: Array<{ type: 'equal' | 'insert' | 'delete'; segments: string[] }> = []
    
    for (const change of changes) {
      const last = consolidated[consolidated.length - 1]
      if (last && last.type === change.type) {
        last.segments.push(...change.segments)
      } else {
        consolidated.push(change)
      }
    }

    return consolidated
  }

  private simpleWordDiff(
    words1: string[], 
    words2: string[]
  ): Array<{ type: 'equal' | 'insert' | 'delete'; words: string[] }> {
    // Simple Myers algorithm implementation
    const changes: Array<{ type: 'equal' | 'insert' | 'delete'; words: string[] }> = []
    
    let i = 0, j = 0
    while (i < words1.length || j < words2.length) {
      if (i < words1.length && j < words2.length && words1[i] === words2[j]) {
        changes.push({ type: 'equal', words: [words1[i]] })
        i++
        j++
      } else if (i < words1.length && (j >= words2.length || words1[i] !== words2[j])) {
        changes.push({ type: 'delete', words: [words1[i]] })
        i++
      } else if (j < words2.length) {
        changes.push({ type: 'insert', words: [words2[j]] })
        j++
      }
    }

    return changes
  }

  private generateChangeDescription(
    change: { type: string; segments: string[] }
  ): string {
    const segmentCount = change.segments.length
    const type = change.type === 'insert' ? 'Added' : 'Removed'
    const unit = segmentCount === 1 ? 'segment' : 'segments'
    
    return `${type} ${segmentCount} ${unit}`
  }

  private generateChangeComment(
    change: { type: string; words: string[] }
  ): string {
    const wordCount = change.words.length
    const type = change.type === 'insert' ? 'Addition' : 'Deletion'
    
    if (wordCount === 1) {
      return `${type}: "${change.words[0]}"`
    } else {
      return `${type} of ${wordCount} words`
    }
  }

  private applyRedlineChange(text: string, change: RedlineChange): string {
    const position = this.findTextPosition(text, change.position)
    if (position < 0) return text

    if (change.type === 'insert') {
      return text.substring(0, position) + change.text + text.substring(position)
    } else if (change.type === 'delete') {
      return text.substring(0, position) + text.substring(position + change.text.length)
    }

    return text
  }

  private findTextPosition(
    text: string, 
    position: { paragraph: number; sentence: number; word: number }
  ): number {
    const paragraphs = text.split(/\n\s*\n/)
    if (position.paragraph >= paragraphs.length) return -1

    const paragraph = paragraphs[position.paragraph]
    const sentences = paragraph.split(/[.!?]+/)
    if (position.sentence >= sentences.length) return -1

    const sentence = sentences[position.sentence]
    const words = sentence.split(/\s+/)
    if (position.word >= words.length) return -1

    // Calculate absolute position
    let absolutePos = 0
    
    // Add previous paragraphs
    for (let i = 0; i < position.paragraph; i++) {
      absolutePos += paragraphs[i].length + 2 // +2 for \n\n
    }

    // Add previous sentences
    for (let i = 0; i < position.sentence; i++) {
      absolutePos += sentences[i].length + 1 // +1 for sentence terminator
    }

    // Add previous words
    for (let i = 0; i < position.word; i++) {
      absolutePos += words[i].length + 1 // +1 for space
    }

    return absolutePos
  }
}

export default PolicyDiffer

// Export main functions for convenience
export const diffPolicies = (
  basePolicy: GeneratedPolicy | string,
  newPolicy: GeneratedPolicy | string,
  options?: DiffOptions
) => {
  const differ = new PolicyDiffer()
  return differ.diffPolicies(basePolicy, newPolicy, options)
}

export const generateRedlineChanges = (
  baseText: string,
  newText: string,
  author?: string,
  options?: DiffOptions
) => {
  const differ = new PolicyDiffer()
  return differ.generateRedlineChanges(baseText, newText, author, options)
}

export const renderRedlineHtml = (
  baseText: string,
  changes: RedlineChange[],
  title?: string
) => {
  const differ = new PolicyDiffer()
  return differ.renderRedlineHtml(baseText, changes, title)
}
