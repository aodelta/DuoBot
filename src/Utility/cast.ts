export function toMacro(parameter: string): 'TARGET' | 'MASTER' | 'NONE' {
    if (parameter == "-target")
        return 'TARGET';
    if (parameter == "-master")
        return 'MASTER';
    
    return 'NONE';
}
