if (peakG >= cfg_->enterG && riseMs <= cfg_->punchMaxRiseMs)
  return Kind::Punch;  // fast + hard -> a punch
if (peakG >= cfg_->movementG)
  return Kind::Move;  // slower push: guard drop, etc
return Kind::None;